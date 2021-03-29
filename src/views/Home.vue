<template lang="pug">
  div
   <Board :currentTiles="currentTiles"/>
   <Rack @updateTiles="updateTiles"/>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Board from '@/components/Board.vue'
import Rack from '@/components/Rack.vue'
import TileModel from '@/models/Tile'

@Component({
  components: {
    Board,
    Rack
  }
})
export default class Game extends Vue {
  private currentTiles: TileModel[] = []

  updateTiles (tiles: TileModel[]): void {
    this.currentTiles = tiles
  }
}
</script>
