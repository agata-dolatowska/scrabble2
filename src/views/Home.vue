<template lang="pug">
  div
   <Board />
   <Rack />
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Board from '@/components/Board.vue'
import Rack from '@/components/Rack.vue'

@Component({
  components: {
    Board,
    Rack
  }
})
export default class Game extends Vue {
}
</script>
