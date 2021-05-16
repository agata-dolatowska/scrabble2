<template lang="pug">
  input(type="text" class="square" v-model="currentSquare.letter" :class="[square.bonus]" :disabled="square.isDisabled" @input="changeLetter" @dragover="allowDrop($event)" @drop="dropTile($event)" @keydown="detectBackspace($event)")
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import SquareModel from '@/models/Square'

@Component
export default class Square extends Vue {
  @Prop({ required: true }) square!: SquareModel

  currentSquare = this.square

  detectBackspace (e: KeyboardEvent): void {
    if ((e.key).toLowerCase() === 'backspace') {
      this.$emit('goToPreviousSquare', this.currentSquare)
    }
  }

  allowDrop (e: any): void {
    e.preventDefault()
  }

  dropTile (e: any): void {
    e.preventDefault()
    this.currentSquare.letter = e.dataTransfer.getData('letter')
    this.$emit('addLetterToWord', this.currentSquare)
  }

  changeLetter () {
    if (/^[a-zA-Z]$/.test(this.currentSquare.letter)) {
      this.currentSquare.letter = this.currentSquare.letter.slice(-1)
      this.$emit('addLetterToWord', this.currentSquare)
    } else {
      this.currentSquare.letter = ''
      this.$emit('removeEmptyLetter', this.currentSquare)
    }
  }
}
</script>
<style lang="scss" scoped>
.square {
    font-size: 30px;
    text-transform: uppercase;
    text-align: center;
    width: 100%;
    background-color: white;
}
.double-letter {
  background-color: lightblue;
}
.triple-letter {
  background-color: lightgreen;
}
.double-word {
  background-color: lightcoral;
}
.triple-word {
  background-color: red;
}
</style>
