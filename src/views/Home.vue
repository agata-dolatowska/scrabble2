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
    if (this.wordCount === 0) {
      const middleSquareId = this.squares.findIndex(square => square.column === 8 && square.column === 8)
      if (this.squares[middleSquareId].letter === '') {
        console.log('pusteee')
      }
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
