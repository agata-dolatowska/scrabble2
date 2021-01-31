<template lang="pug">
  div
    div.board-container
      <Square v-for="square in squares" :key="square.id" :square="square" @addLetterToWord="addLetterToWord" @removeEmptyLetter="removeEmptyLetter"/>
    button(@click="checkWord") check word
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SquareModel from '@/models/Square'
import WordModel from '@/models/Word'
import doubleLetterSquares from '@/game-assets/board-squares/double-letter'
import doubleWordSquares from '@/game-assets/board-squares/double-word'
import tripleLetterSquares from '@/game-assets/board-squares/triple-letter'
import tripleWordSquares from '@/game-assets/board-squares/triple-word'
import Square from '@/components/Square.vue'

@Component({
  components: {
    Square
  }
})
export default class Board extends Vue {
  private squares: SquareModel[] = []
  private currentWord = new WordModel()
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

    this.correctLettersOrder()

    this.checkWordBeginning()

    this.checkWordEnding()

    if (this.checkGaps()) {
      wordOk = false
    }

    if (!this.crossedWord()) {
      wordOk = false
    }

    this.correctLettersOrder()
    if (wordOk) {
      this.savedWords.push(this.currentWord)
      this.wordCount++
    } else {
      this.removeWordFromBoard()
    }

    this.currentWord = new WordModel()
  }

  crossedWord (): boolean {
    let crossedWord = !!(this.wordCount === 0)
    const usedLetters = []

    for (const word of this.savedWords) {
      usedLetters.push(...word.letters)
    }

    for (const currentWordLetter of this.currentWord.letters) {
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

    for (const squareInWord of this.currentWord.letters) {
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

      if (this.currentWord.letters.length < 2) {
        console.log('za krótkie słowo')
        wordOk = false
      }
    }

    if (this.currentWord.letters.length > this.maxTypedLetters) {
      console.log('za długie')
      wordOk = false
    }

    if (this.wordCount > 0 && this.currentWord.letters.length < 1) {
      console.log('chociaż jedna literka :<')
      wordOk = false
    }

    return wordOk
  }

  checkWordBeginning (): void {
    const firstLetterId = this.squares.findIndex(square => square.id === this.currentWord.letters[0].id)
    let letterId = firstLetterId

    if (this.currentWord.orientation === 'horizontal') {
      letterId -= 1

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].row === this.currentWord.letters[0].row && letterId >= 0; letterId -= 1) {
        this.currentWord.letters.unshift(this.squares[letterId])
      }
    }

    if (this.currentWord.orientation === 'vertical') {
      letterId -= 15

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].column === this.currentWord.letters[0].column && letterId >= 0; letterId -= 15) {
        this.currentWord.letters.unshift(this.squares[letterId])
      }
    }
  }

  checkWordEnding (): void {
    const lastLetterId = this.squares.findIndex(square => square.id === this.currentWord.letters[this.currentWord.letters.length - 1].id)
    let letterId = lastLetterId

    if (this.currentWord.orientation === 'horizontal') {
      letterId = lastLetterId + 1

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].row === this.currentWord.letters[this.currentWord.letters.length - 1].row && letterId <= this.squares.length - 1; letterId += 1) {
        this.currentWord.letters.push(this.squares[letterId])
      }
    }

    if (this.currentWord.orientation === 'vertical') {
      letterId = lastLetterId + 15

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].column === this.currentWord.letters[this.currentWord.letters.length - 1].column && letterId <= this.squares.length - 1; letterId += 15) {
        this.currentWord.letters.push(this.squares[letterId])
      }
    }
  }

  checkGaps (): boolean {
    let hasGaps = false
    let letterUsedInWord = false
    const squaresToAdd: SquareModel[] = []
    const firstLetterId = this.squares.findIndex(letter => letter === this.currentWord.letters[0])
    const lastLetterId = this.squares.findIndex(letter => letter === this.currentWord.letters[this.currentWord.letters.length - 1])
    const nextId = this.currentWord.orientation === 'horizontal' ? 1 : 15

    for (let letterId = firstLetterId; letterId < lastLetterId; letterId += nextId) {
      letterUsedInWord = this.currentWord.letters.some(letter => letter.id === this.squares[letterId].id)

      if (this.squares[letterId].letter !== '' && !letterUsedInWord
      ) {
        squaresToAdd.push(this.squares[letterId])
      }

      if (this.squares[letterId].letter === '' && !letterUsedInWord) {
        hasGaps = true
      }
    }

    this.currentWord.letters.push(...squaresToAdd)
    return hasGaps
  }

  correctLettersOrder (): void {
    if (this.currentWord.orientation === 'horizontal') {
      this.currentWord.letters.sort((letterA, letterB) => letterA.column - letterB.column)
    }

    if (this.currentWord.orientation === 'vertical') {
      this.currentWord.letters.sort((letterA, letterB) => letterA.row - letterB.row)
    }
  }

  wordOrientationCorrect (): boolean {
    const wordIsHorizontal = this.wordHorizontal()
    const wordIsVertical = this.wordVertical()
    let wordOrientationOk = true

    if (wordIsHorizontal) {
      this.currentWord.orientation = 'horizontal'
    }

    if (wordIsVertical) {
      this.currentWord.orientation = 'vertical'
    }

    console.log('vertical', wordIsVertical, 'horizontal', wordIsHorizontal)
    if ((wordIsHorizontal && wordIsVertical) ||
    (!wordIsHorizontal && !wordIsVertical)
    ) {
      this.currentWord.orientation = ''
      console.log('porozrzucane :<')
      wordOrientationOk = false
    }

    return wordOrientationOk
  }

  wordHorizontal (): boolean {
    let isHorizontal = true
    const rowNumber = this.currentWord.letters[0].row

    for (const letter of this.currentWord.letters) {
      if (letter.row !== rowNumber) {
        isHorizontal = false
      }
    }

    return isHorizontal
  }

  wordVertical (): boolean {
    let isVertical = true
    const columnNumber = this.currentWord.letters[0].column

    for (const letter of this.currentWord.letters) {
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
    const letterId = this.currentWord.letters.findIndex(letter => letter.id === newLetter.id)

    if (letterId >= 0) {
      this.currentWord.letters[letterId] = newLetter
    }

    if (letterId === -1) {
      this.currentWord.letters.push(newLetter)
    }
  }

  removeEmptyLetter (letterToDelete: SquareModel): void {
    const letterId = this.currentWord.letters.findIndex(letter => letter.id === letterToDelete.id)

    this.currentWord.letters.splice(letterId, 1)
  }
}
</script>

<style lang="scss" scoped>
.board-container {
  display: grid;
  grid-template-columns: repeat(15, 40px);
}
</style>
