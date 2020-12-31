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

    if (this.wordCount === 0) {
      const middleSquareId = this.currentWord.findIndex(square => square.column === 8 && square.column === 8)
      if (this.currentWord[middleSquareId].letter === '') {
        console.log('pusteee')
        wordOk = false
      }

      if (this.currentWord.length < 2) {
        console.log('za krótkie słowo')
        wordOk = false
      }

      if (this.currentWord.length > this.maxTypedLetters) {
        console.log('za długie')
        wordOk = false
      }
    } else {
      console.log('chociaż jedna literka :<')
      wordOk = false
    }

    if (!this.wordOrientation()) {
      console.log('porozrzucane :<')
    }

    this.correctLettersOrder()

    if (this.checkGaps()) {
      wordOk = false
    }

    this.correctLettersOrder()

    if (wordOk) {
      let squareId: number

      for (const letter of this.currentWord) {
        squareId = this.squares.findIndex(square =>
          square.row === letter.row && square.column === letter.column)
        this.squares[squareId].letter = letter.letter
      }

      this.wordCount++
    } else {
      // this.removeWordFromBoard()
    }

    // this.currentWord = []

    this.blockAllSquares()

    if (this.wordCount === 0) {
      this.unblockSquaresForStart()
    } else {
      this.unblockSquares()
    }
  }

  removeWordFromBoard (): void {
    let squareId = 0

    for (const squareInWord of this.currentWord) {
      squareId = this.squares.findIndex(square => square.row === squareInWord.row && square.column === squareInWord.column)

      this.squares[squareId].letter = ''
    }
  }

  checkGaps (): boolean {
    let hasGaps = false
    let squareIdInCollection = 0
    const squaresToAdd: SquareModel[] = []

    for (let letterId = 0; letterId < this.currentWord.length - 1; letterId += 1) {
      if (this.nextLetterEmpty(letterId)) {
        squareIdInCollection = this.nextSquareId(letterId)

        if (squareIdInCollection >= 0 && this.squares[squareIdInCollection].letter !== '') {
          squaresToAdd.push(this.squares[squareIdInCollection])
        } else {
          hasGaps = true
        }
      }
    }

    this.currentWord.push(...squaresToAdd)
    return hasGaps
  }

  nextLetterEmpty (letterId: number): boolean {
    let isEmpty = false

    if (this.currentWordOrientation === 'horizontal' &&
    this.currentWord[letterId + 1].column - this.currentWord[letterId].column !== 1) {
      isEmpty = true
    }

    if (this.currentWordOrientation === 'vertical' &&
      this.currentWord[letterId + 1].row - this.currentWord[letterId].row !== 1) {
      isEmpty = true
    }

    return isEmpty
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

  wordOrientation (): boolean {
    const wordIsHorizontal = this.wordHorizontal()
    const wordIsVertical = this.wordVertical()
    let wordOrientationOk = true

    if (wordIsHorizontal) {
      this.currentWordOrientation = 'horizontal'
    }

    if (wordIsVertical) {
      this.currentWordOrientation = 'vertical'
    }

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

    if (letterId >= 0 && this.currentWord.length < this.maxTypedLetters) {
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
