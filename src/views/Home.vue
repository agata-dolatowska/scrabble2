<template lang="pug">
  div.board-container
    <Square v-for="square in squares" :key="square.id" :square="square" />
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

  mounted () {
    this.createSquares()
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
        this.squares.push(new SquareModel(`${(rowNumber + 9).toString(36)}${columnNumber}`, columnNumber, rowNumber))
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
}
</script>

<style lang="scss" scoped>
.board-container {
  display: grid;
  grid-template-columns: repeat(15, 40px);
}
</style>
