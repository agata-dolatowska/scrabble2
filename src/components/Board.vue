<template lang="pug">
  div
    div.board-container
      <Square v-for="square in squares" :key="square.id" :square="square" @addLetterToWord="addLetterToWord" @removeEmptyLetter="removeEmptyLetter"/>
    button(@click="checkWord" :disabled="typedWord.letters.length === 0") check word
    <Scoreboard :savedWords="savedWords"/>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import SquareModel from '@/models/Square'
import WordModel from '@/models/Word'
import doubleLetterSquares from '@/game-assets/board-squares/double-letter'
import doubleWordSquares from '@/game-assets/board-squares/double-word'
import tripleLetterSquares from '@/game-assets/board-squares/triple-letter'
import tripleWordSquares from '@/game-assets/board-squares/triple-word'
import Square from '@/components/Square.vue'
import Scoreboard from '@/components/Scoreboard.vue'
import TileModel from '@/models/Tile'

@Component({
  components: {
    Square,
    Scoreboard
  }
})
export default class Board extends Vue {
  @Prop() currentTiles!: TileModel[]
  private squares: SquareModel[] = []
  private typedWord = new WordModel()
  private additionalWords: WordModel[] = []
  private savedWords: WordModel[] = []
  private maxTypedLetters = 7
  private wordCount = 0

  mounted () {
    this.createSquares()
  }

  checkWord () {
    let wordOk = true

    if (!this.wordLengthCorrect()) {
      wordOk = false
    }

    if (!this.wordOrientationCorrect()) {
      wordOk = false
    }

    if (this.typedWord.letters.length > 1) {
      this.correctLettersOrder(this.typedWord)
    }

    if (!this.lettersMatchTiles()) {
      wordOk = false
    }

    this.checkWordBeginning(this.typedWord.letters[0], this.typedWord.orientation)

    this.checkWordEnding(this.typedWord.letters[this.typedWord.letters.length - 1], this.typedWord.orientation)

    if (this.checkGaps()) {
      wordOk = false
    }

    if (!this.crossedWord() && !this.parallelWord()) {
      wordOk = false
    }

    if (this.typedWord.letters.length > 1) {
      this.correctLettersOrder(this.typedWord)
    }

    this.additionalWordsCheck()

    if (wordOk) {
      this.savedWords.push(this.typedWord, ...this.additionalWords)
      this.wordCount++
    } else {
      this.removeWordFromBoard()
    }

    this.typedWord = new WordModel()
    this.additionalWords = []
  }

  lettersMatchTiles (): boolean {
    const tiles: TileModel[] = JSON.parse(JSON.stringify(this.currentTiles))
    let tileId = 0
    let match = true

    for (const letter of this.typedWord.letters) {
      tileId = tiles.findIndex(tile => tile.letter.toUpperCase() === letter.letter.toUpperCase())
      if (tileId >= 0) {
        tiles.splice(tileId, 1)
      } else {
        match = false
      }
    }

    return match
  }

  additionalWordsCheck (): void {
    let orientation = ''
    let additionalWordId = 0

    switch (this.typedWord.orientation) {
      case 'horizontal':
        orientation = 'vertical'
        break
      case 'vertical':
        orientation = 'horizontal'
        break
    }

    for (const letter in this.typedWord.letters) {
      this.checkWordBeginning(this.typedWord.letters[letter], orientation, additionalWordId)
      this.checkWordEnding(this.typedWord.letters[letter], orientation, additionalWordId)

      if (this.additionalWords[additionalWordId] !== undefined) {
        this.additionalWords[additionalWordId].letters.push(this.typedWord.letters[letter])
        this.correctLettersOrder(this.additionalWords[additionalWordId])
        additionalWordId++
      }
    }
  }

  parallelWord (): boolean {
    let isParallel = false
    let squareId = 0

    for (const letter of this.typedWord.letters) {
      squareId = this.squares.findIndex(square => square.id === letter.id)

      if (this.typedWord.orientation === 'horizontal' && (this.squares[squareId + 15].letter !== '' || this.squares[squareId - 15].letter !== '')) {
        isParallel = true
        break
      }

      if (this.typedWord.orientation === 'vertical' && (this.squares[squareId + 1].letter !== '' || this.squares[squareId - 1].letter !== '')) {
        isParallel = true
        break
      }
    }

    return isParallel
  }

  crossedWord (): boolean {
    let crossedWord = !!(this.wordCount === 0)
    const usedLetters = []

    for (const word of this.savedWords) {
      usedLetters.push(...word.letters)
    }

    for (const currentWordLetter of this.typedWord.letters) {
      if (usedLetters.some(letter => letter.id === currentWordLetter.id
      )) {
        crossedWord = true
      }
    }

    return crossedWord
  }

  removeWordFromBoard (): void {
    let squareId = 0
    let squareUsed = false

    for (const squareInWord of this.typedWord.letters) {
      squareUsed = this.savedWords.some(word =>
        word.letters.some(letter => letter.row === squareInWord.row && letter.column === squareInWord.column)
      )

      if (!squareUsed) {
        squareId = this.squares.findIndex(square => square.id === squareInWord.id)

        this.squares[squareId].letter = ''
      }
    }
  }

  wordLengthCorrect (): boolean {
    let wordOk = true
    const middleSquareId = this.squares.findIndex(square => square.column === 8 && square.row === 8)

    if (this.wordCount === 0) {
      if (this.squares[middleSquareId].letter === '') {
        console.log('puste środkowe pole')
        wordOk = false
      }

      if (this.typedWord.letters.length < 2) {
        console.log('za krótkie słowo')
        wordOk = false
      }
    }

    if (this.typedWord.letters.length > this.maxTypedLetters) {
      console.log('za długie')
      wordOk = false
    }

    if (this.wordCount > 0 && this.typedWord.letters.length < 1) {
      console.log('chociaż jedna literka :<')
      wordOk = false
    }

    return wordOk
  }

  checkWordBeginning (firstLetter: SquareModel, orientation: string, additionalId?: number): void {
    const firstLetterId = this.squares.findIndex(square => square.id === firstLetter.id)
    const newAdditionalWord = new WordModel()
    let letterId = firstLetterId

    if (orientation === 'horizontal' || orientation === 'both') {
      letterId -= 1

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].row === firstLetter.row && letterId >= 0; letterId -= 1) {
        if (additionalId !== undefined) {
          newAdditionalWord.letters.unshift(this.squares[letterId])
        } else {
          this.typedWord.letters.unshift(this.squares[letterId])
        }

        if (this.typedWord.orientation === 'both') {
          this.typedWord.orientation = 'horizontal'
        }
      }
    }

    if (orientation === 'vertical' || orientation === 'both') {
      letterId -= 15

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].column === firstLetter.column && letterId >= 0; letterId -= 15) {
        if (additionalId !== undefined) {
          newAdditionalWord.letters.unshift(this.squares[letterId])
        } else {
          this.typedWord.letters.unshift(this.squares[letterId])
        }

        if (this.typedWord.orientation === 'both') {
          this.typedWord.orientation = 'vertical'
        }
      }
    }

    if (newAdditionalWord.letters.length > 0 && additionalId !== undefined) {
      if (!this.additionalWords[additionalId]) {
        this.additionalWords[additionalId] = new WordModel()
      }

      this.additionalWords[additionalId].letters = newAdditionalWord.letters
      this.additionalWords[additionalId].orientation = orientation
    }
  }

  checkWordEnding (lastLetter: SquareModel, orientation: string, additionalId?: number): void {
    const lastLetterId = this.squares.findIndex(square => square.id === lastLetter.id)
    const newAdditionalWord = new WordModel()
    let letterId = lastLetterId

    if (orientation === 'horizontal' || orientation === 'both') {
      letterId = lastLetterId + 1

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].row === lastLetter.row && letterId <= this.squares.length - 1; letterId += 1) {
        if (additionalId !== undefined) {
          newAdditionalWord.letters.push(this.squares[letterId])
        } else {
          this.typedWord.letters.push(this.squares[letterId])
        }

        if (this.typedWord.orientation === 'both') {
          this.typedWord.orientation = 'horizontal'
        }
      }
    }

    if (orientation === 'vertical' || orientation === 'both') {
      letterId = lastLetterId + 15

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].column === lastLetter.column && letterId <= this.squares.length - 1; letterId += 15) {
        if (additionalId !== undefined) {
          newAdditionalWord.letters.push(this.squares[letterId])
        } else {
          this.typedWord.letters.push(this.squares[letterId])
        }

        if (this.typedWord.orientation === 'both') {
          this.typedWord.orientation = 'vertical'
        }
      }
    }

    if (newAdditionalWord.letters.length > 0 && additionalId !== undefined) {
      if (!this.additionalWords[additionalId]) {
        this.additionalWords[additionalId] = new WordModel()
      }

      this.additionalWords[additionalId].letters = newAdditionalWord.letters
      this.additionalWords[additionalId].orientation = orientation
    }
  }

  checkGaps (): boolean {
    let hasGaps = false
    let letterUsedInWord = false
    const squaresToAdd: SquareModel[] = []
    const firstLetterId = this.squares.findIndex(letter => letter === this.typedWord.letters[0])
    const lastLetterId = this.squares.findIndex(letter => letter === this.typedWord.letters[this.typedWord.letters.length - 1])
    const nextId = this.typedWord.orientation === 'horizontal' ? 1 : 15

    for (let letterId = firstLetterId; letterId < lastLetterId; letterId += nextId) {
      letterUsedInWord = this.typedWord.letters.some(letter => letter.id === this.squares[letterId].id)

      if (this.squares[letterId].letter !== '' && !letterUsedInWord
      ) {
        squaresToAdd.push(this.squares[letterId])
      }

      if (this.squares[letterId].letter === '' && !letterUsedInWord) {
        hasGaps = true
      }
    }

    this.typedWord.letters.push(...squaresToAdd)
    return hasGaps
  }

  correctLettersOrder (word: WordModel): void {
    if (word.orientation === 'horizontal') {
      word.letters.sort((letterA, letterB) => letterA.column - letterB.column)
    }

    if (word.orientation === 'vertical') {
      word.letters.sort((letterA, letterB) => letterA.row - letterB.row)
    }
  }

  wordOrientationCorrect (): boolean {
    const wordIsHorizontal = this.wordHorizontal()
    const wordIsVertical = this.wordVertical()
    let wordOrientationOk = true

    if (this.typedWord.letters.length > 1) {
      if (wordIsHorizontal) {
        this.typedWord.orientation = 'horizontal'
      }

      if (wordIsVertical) {
        this.typedWord.orientation = 'vertical'
      }

      if ((wordIsHorizontal && wordIsVertical) ||
    (!wordIsHorizontal && !wordIsVertical)
      ) {
        this.typedWord.orientation = ''
        console.log('porozrzucane :<')
        wordOrientationOk = false
      }
    } else {
      this.typedWord.orientation = 'both'
    }

    return wordOrientationOk
  }

  wordHorizontal (): boolean {
    let isHorizontal = true
    const rowNumber = this.typedWord.letters[0].row

    for (const letter of this.typedWord.letters) {
      if (letter.row !== rowNumber) {
        isHorizontal = false
      }
    }

    return isHorizontal
  }

  wordVertical (): boolean {
    let isVertical = true
    const columnNumber = this.typedWord.letters[0].column

    for (const letter of this.typedWord.letters) {
      if (letter.column !== columnNumber) {
        isVertical = false
      }
    }

    return isVertical
  }

  createSquares (): void {
    const allBonusSquares: {[key: string]: string[]} = {
      'double-letter': doubleLetterSquares,
      'double-word': doubleWordSquares,
      'triple-letter': tripleLetterSquares,
      'triple-word': tripleWordSquares
    }
    let squareWithBonusId: number

    for (let rowNumber = 1; rowNumber <= 15; rowNumber += 1) {
      for (let columnNumber = 1; columnNumber <= 15; columnNumber += 1) {
        this.squares.push(new SquareModel(`${(rowNumber + 9).toString(36)}${columnNumber}`, rowNumber, columnNumber))
      }
    }

    for (const bonusType in allBonusSquares) {
      for (const bonusSquare in allBonusSquares[bonusType]) {
        squareWithBonusId = this.squares.findIndex(square => square.id === allBonusSquares[bonusType][bonusSquare])

        if (squareWithBonusId >= 0) {
          this.squares[squareWithBonusId].bonus = bonusType
        }
      }
    }
  }

  addLetterToWord (newLetter: SquareModel): void {
    const letterId = this.typedWord.letters.findIndex(letter => letter.id === newLetter.id)

    if (letterId >= 0) {
      this.typedWord.letters[letterId] = newLetter
    }

    if (letterId === -1) {
      this.typedWord.letters.push(newLetter)
    }
  }

  removeEmptyLetter (letterToDelete: SquareModel): void {
    const letterId = this.typedWord.letters.findIndex(letter => letter.id === letterToDelete.id)

    this.typedWord.letters.splice(letterId, 1)
  }
}
</script>

<style lang="scss" scoped>
.board-container {
  display: grid;
  grid-template-columns: repeat(15, 40px);
}
</style>
