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
  private currentWord: SquareModel[] = []
  private savedWords: WordModel[] = []
  private currentWordOrientation = ''
  private maxTypedLetters = 7
  private wordCount = 0

  mounted () {
    this.createSquares()

    if (this.wordCount === 0) {
      this.unblockSquaresForStart()
    }
  }

  checkWord () {
    let wordOk = true

    this.wordLengthCheck()

    if (!this.wordOrientationCorrect()) {
      wordOk = false
    }

    this.correctLettersOrder()

    this.checkWordBeginning()

    this.checkWordEnding()

    if (this.checkGaps()) {
      wordOk = false
    }

    this.correctLettersOrder()
    if (wordOk) {
      const wordId = this.savedWords.length

      this.savedWords.push(new WordModel(wordId, this.currentWord))

      this.wordCount++
    } else {
      this.removeWordFromBoard()
    }

    this.currentWord = []

    this.blockAllSquares()

    if (this.wordCount === 0) {
      this.unblockSquaresForStart()
    } else {
      this.unblockSquares()
    }
  }

  removeWordFromBoard (): void {
    let squareId = 0
    let squareUsed = false

    for (const squareInWord of this.currentWord) {
      squareUsed = this.savedWords.some(word =>
        word.letters.some(letter => letter.row === squareInWord.row && letter.column === squareInWord.column)
      )

      if (!squareUsed) {
        squareId = this.squares.findIndex(square => square.row === squareInWord.row && square.column === squareInWord.column)

        this.squares[squareId].letter = ''
      }
    }
  }

  wordLengthCheck (): boolean {
    let wordOk = true
    const middleSquareId = this.squares.findIndex(square => square.column === 8 && square.row === 8)

    if (this.wordCount === 0) {
      if (this.squares[middleSquareId].letter === '') {
        console.log('puste środkowe pole')
        wordOk = false
      }

      if (this.currentWord.length < 2) {
        console.log('za krótkie słowo')
        wordOk = false
      }
    }

    if (this.currentWord.length > this.maxTypedLetters) {
      console.log('za długie')
      wordOk = false
    }

    if (this.wordCount > 0 && this.currentWord.length < 1) {
      console.log('chociaż jedna literka :<')
      wordOk = false
    }

    return wordOk
  }

  checkWordBeginning (): void {
    const firstLetterId = this.squares.findIndex(square => square.id === this.currentWord[0].id)
    let letterId = firstLetterId

    if (this.currentWordOrientation === 'horizontal') {
      letterId -= 1

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].row === this.currentWord[0].row && letterId >= 0; letterId -= 1) {
        this.currentWord.unshift(this.squares[letterId])
      }
    }

    if (this.currentWordOrientation === 'vertical') {
      letterId -= 15

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].column === this.currentWord[0].column && letterId >= 0; letterId -= 15) {
        this.currentWord.unshift(this.squares[letterId])
      }
    }
  }

  checkWordEnding (): void {
    const lastLetterId = this.squares.findIndex(square => square.id === this.currentWord[this.currentWord.length - 1].id)
    let letterId = lastLetterId

    if (this.currentWordOrientation === 'horizontal') {
      letterId = lastLetterId + 1

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].row === this.currentWord[this.currentWord.length - 1].row && letterId <= this.squares.length - 1; letterId += 1) {
        this.currentWord.push(this.squares[letterId])
      }
    }

    if (this.currentWordOrientation === 'vertical') {
      letterId = lastLetterId + 15

      for (letterId; this.squares[letterId].letter !== '' && this.squares[letterId].column === this.currentWord[this.currentWord.length - 1].column && letterId <= this.squares.length - 1; letterId += 15) {
        this.currentWord.push(this.squares[letterId])
      }
    }
  }

  checkGaps (): boolean {
    let hasGaps = false
    let letterUsedInWord = false
    const squaresToAdd: SquareModel[] = []
    const firstLetterId = this.squares.findIndex(letter => letter === this.currentWord[0])
    const lastLetterId = this.squares.findIndex(letter => letter === this.currentWord[this.currentWord.length - 1])
    const nextId = this.currentWordOrientation === 'horizontal' ? 1 : 15

    for (let letterId = firstLetterId; letterId < lastLetterId; letterId += nextId) {
      letterUsedInWord = this.currentWord.some(letter => letter.id === this.squares[letterId].id)

      if (this.squares[letterId].letter !== '' && !letterUsedInWord
      ) {
        squaresToAdd.push(this.squares[letterId])
      }

      if (this.squares[letterId].letter === '' && !letterUsedInWord) {
        hasGaps = true
      }
    }

    this.currentWord.push(...squaresToAdd)
    return hasGaps
  }

  nextSquareId (letterId: number): number {
    let squareIdInCollection = 0
    const nextColumn = this.currentWordOrientation === 'horizontal' ? 1 : 0
    const nextRow = this.currentWordOrientation === 'vertical' ? 1 : 0

    squareIdInCollection = this.squares.findIndex(square => square.row === this.currentWord[letterId].row + nextRow && square.column === this.currentWord[letterId].column) + nextColumn

    return squareIdInCollection
  }

  correctLettersOrder (): void {
    if (this.currentWordOrientation === 'horizontal') {
      this.currentWord.sort((letterA, letterB) => letterA.column - letterB.column)
    }

    if (this.currentWordOrientation === 'vertical') {
      this.currentWord.sort((letterA, letterB) => letterA.row - letterB.row)
    }
  }

  wordOrientationCorrect (): boolean {
    const wordIsHorizontal = this.wordHorizontal()
    const wordIsVertical = this.wordVertical()
    let wordOrientationOk = true

    if (wordIsHorizontal) {
      this.currentWordOrientation = 'horizontal'
    }

    if (wordIsVertical) {
      this.currentWordOrientation = 'vertical'
    }

    console.log('vertical', wordIsVertical, 'horizontal', wordIsHorizontal)
    if ((wordIsHorizontal && wordIsVertical) ||
    (!wordIsHorizontal && !wordIsVertical)
    ) {
      this.currentWordOrientation = ''
      console.log('porozrzucane :<')
      wordOrientationOk = false
    }

    return wordOrientationOk
  }

  wordHorizontal (): boolean {
    let isHorizontal = true
    const rowNumber = this.currentWord[0].row

    for (const letter of this.currentWord) {
      if (letter.row !== rowNumber) {
        isHorizontal = false
      }
    }

    return isHorizontal
  }

  wordVertical (): boolean {
    let isVertical = true
    const columnNumber = this.currentWord[0].column

    for (const letter of this.currentWord) {
      if (letter.column !== columnNumber) {
        isVertical = false
      }
    }

    return isVertical
  }

  unblockSquares (): void {
    let nextRowItemId = 0
    let squareIdParsed = 0

    for (const squareId in this.squares) {
      squareIdParsed = parseInt(squareId)

      for (let i = -this.maxTypedLetters; i <= this.maxTypedLetters; i++) {
        if (this.squares[squareIdParsed].letter !== '' &&
          squareIdParsed + i < this.squares.length - 1 &&
          squareIdParsed + i >= 0) {
          if (this.squares[squareIdParsed + i].letter === '' &&
            this.squares[squareIdParsed].row === this.squares[squareIdParsed + i].row
          ) {
            this.squares[squareIdParsed + i].isDisabled = false
          }
        }

        nextRowItemId = this.squares.findIndex(square => square.column === this.squares[squareId].column && square.row === this.squares[squareId].row + i)

        if (this.squares[squareIdParsed].letter !== '' &&
          nextRowItemId >= 0) {
          if (this.squares[nextRowItemId].letter === '' &&
            this.squares[squareIdParsed].column === this.squares[nextRowItemId].column
          ) {
            this.squares[nextRowItemId].isDisabled = false
          }
        }
      }
    }
  }

  blockAllSquares (): void {
    for (const square of this.squares) {
      square.isDisabled = true
    }
  }

  unblockSquaresForStart (): void {
    let squareId = 0

    for (let columnNumber = 2; columnNumber <= 14; columnNumber += 1) {
      squareId = this.squares.findIndex(square => square.row === 8 && square.column === columnNumber)

      this.squares[squareId].isDisabled = false
    }

    for (let rowNumber = 2; rowNumber <= 14; rowNumber += 1) {
      squareId = this.squares.findIndex(square => square.row === rowNumber && square.column === 8)

      this.squares[squareId].isDisabled = false
    }
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
    const letterId = this.currentWord.findIndex(letter => letter.id === newLetter.id)

    if (letterId >= 0) {
      this.currentWord[letterId] = newLetter
    }

    if (letterId === -1 && this.currentWord.length < this.maxTypedLetters) {
      this.currentWord.push(newLetter)
    }
  }

  removeEmptyLetter (letterToDelete: SquareModel): void {
    const letterId = this.currentWord.findIndex(letter => letter.id === letterToDelete.id)

    this.currentWord.splice(letterId, 1)
  }
}
</script>

<style lang="scss" scoped>
.board-container {
  display: grid;
  grid-template-columns: repeat(15, 40px);
}
</style>
