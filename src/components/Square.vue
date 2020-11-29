<template lang="pug">
  input(type="text" class="square" :class="[square.bonus]")
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import SquareModel from '@/models/Square'

@Component
export default class Square extends Vue {
  @Prop({ required: true }) square!: SquareModel
}
</script>
<style lang="scss" scoped>
.square {
    font-size: 30px;
    text-transform: uppercase;
    text-align: center;
    width: 100%;
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
