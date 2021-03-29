<template lang="pug">
    .rack-container
        <Tile v-for="tile in currentTiles" :tile="tile" />
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Tile from '@/components/Tile.vue'
import defaultTiles from '@/game-assets/tiles'
import TileModel from '@/models/Tile'

@Component({
  components: {
    Tile
  }
})
export default class Rack extends Vue {
    private tiles: TileModel[] = [];
    private currentTiles: TileModel[] = [];

    mounted () {
      this.createNewSetOfTiles()
      this.chooseSevenRandomLetters()
    }

    createNewSetOfTiles (): void {
      this.tiles = JSON.parse(JSON.stringify(defaultTiles))
    }

    chooseSevenRandomLetters (): void {
      let randomIndex = 0

      while (this.currentTiles.length <= 6) {
        randomIndex = Math.floor(Math.random() * (this.tiles.length - 0))

        if (this.tiles[randomIndex].amount > 0) {
          this.tiles[randomIndex].amount -= 1
          this.currentTiles.push(this.tiles[randomIndex])
        }
      }

      this.$emit('updateTiles', this.currentTiles)
    }
}
</script>

<style lang="scss" scoped>
.rack-container {
  display: flex;
  flex-wrap: wrap;
}
</style>
