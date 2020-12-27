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
  private maxWordLength = 7
  private wordCount = 0

  mounted () {
    this.createSquares()

    if (this.wordCount === 0) {
      this.unblockSquaresForStart()
    }
  }

  checkWord () {
    const wordIsHorizontal = this.wordHorizontal()
    const wordIsVertical = this.wordVertical()
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

      if (this.currentWord.length > 7) {
        console.log('za długie')
        wordOk = false
      }
    } else {
      console.log('chociaż jedna literka :<')
      wordOk = false
    }

    if ((wordIsHorizontal &&
    wordIsVertical) ||
    (!wordIsHorizontal &&
    !wordIsVertical)
    ) {
      console.log('porozrzucane :<')
      wordOk = false
    }

    this.correctLettersOrder(wordIsHorizontal, wordIsVertical)

    if (this.checkGaps(wordIsHorizontal, wordIsVertical)) {
      wordOk = false
    }

    if (wordOk) {
      let squareId: number

      for (const letter of this.currentWord) {
        squareId = this.squares.findIndex(square =>
          square.row === letter.row && square.column === letter.column)
        this.squares[squareId].letter = letter.letter
      }
    }

    this.currentWord = []
    this.blockAllSquares()
    this.unblockSquares()
  }

  checkGaps (horizontal: boolean, vertical: boolean): boolean {
    let currentId = 0

    if (horizontal) {
      this.currentWord.forEach((letter, letterId) => {
        if (letterId === 0) {
          currentId = letter.column
        } else {
          if (letter.column === currentId + 1) {
            currentId++
          } else {
            console.log('dziura')
            return true
          }
        }
      })
    }

    if (vertical) {
      this.currentWord.forEach((letter, letterId) => {
        if (letterId === 0) {
          currentId = letter.row
        } else {
          if (letter.row === currentId + 1) {
            currentId++
          } else {
            console.log('dziura')
            return true
          }
        }
      })
    }

    return false
  }

  correctLettersOrder (horizontal: boolean, vertical: boolean) {
    if (horizontal) {
      this.currentWord.sort((letterA, letterB) => letterA.column - letterB.column)
    }

    if (vertical) {
      this.currentWord.sort((letterA, letterB) => letterA.row - letterB.row)
    }
  }

  wordHorizontal () {
    let isHorizontal = true
    const rowNumber = this.currentWord[0].row

    for (const letter of this.currentWord) {
      if (letter.row !== rowNumber) {
        isHorizontal = false
      }
    }

    return isHorizontal
  }

  wordVertical () {
    let isVertical = true
    const columnNumber = this.currentWord[0].column

    for (const letter of this.currentWord) {
      if (letter.column !== columnNumber) {
        isVertical = false
      }
    }

    return isVertical
  }

  unblockSquares () {
    let nextRowItemId = 0

    for (const squareId in this.squares) {
      for (let i = -7; i <= 7; i++) {
        if (this.squares[parseInt(squareId)].letter !== '' &&
          parseInt(squareId) + i < this.squares.length - 1 &&
          parseInt(squareId) + i >= 0) {
          if (this.squares[parseInt(squareId) + i].letter === '' &&
            this.squares[parseInt(squareId)].row === this.squares[parseInt(squareId) + i].row
          ) {
            this.squares[parseInt(squareId) + i].isDisabled = false
          }
        }

        nextRowItemId = this.squares.findIndex(square => square.column === this.squares[squareId].column && square.row === this.squares[squareId].row + i)

        if (this.squares[parseInt(squareId)].letter !== '' &&
          nextRowItemId >= 0) {
          if (this.squares[nextRowItemId].letter === '' &&
            this.squares[parseInt(squareId)].column === this.squares[nextRowItemId].column
          ) {
            this.squares[nextRowItemId].isDisabled = false
          }
        }
      }
    }
  }

  blockAllSquares () {
    for (const square of this.squares) {
      square.isDisabled = true
    }
  }

  unblockSquaresForStart () {
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

  createSquares () {
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

  addLetterToWord (newLetter: SquareModel) {
    const letterId = this.currentWord.findIndex(letter => letter.id === newLetter.id)

    if (letterId >= 0 && this.currentWord.length < this.maxWordLength) {
      this.currentWord[letterId] = newLetter
    }

    if (letterId === -1 && this.currentWord.length < this.maxWordLength) {
      this.currentWord.push(newLetter)
    }
  }

  removeEmptyLetter (letterToDelete: SquareModel) {
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
