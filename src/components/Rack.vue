<template lang="pug">
    .rack-container
        <Tile v-for="tile in currentTiles" :tile="tile" />
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import Tile from '@/components/Tile.vue'
import TileModel from '@/models/Tile'

@Component({
  components: {
    Tile
  }
})
export default class Rack extends Vue {
  @Prop() tiles!: TileModel[]
  @Prop() currentTiles!: TileModel[]

  mounted () {
    this.chooseRandomLetters()
  }

  chooseRandomLetters (): void {
    let randomIndex = 0
    const newSetOfTiles: TileModel[] = JSON.parse(JSON.stringify(this.currentTiles))

    while (newSetOfTiles.length <= 6) {
      randomIndex = Math.floor(Math.random() * (this.tiles.length - 0))
      if (this.tiles[randomIndex].amount > 0) {
        newSetOfTiles.push(this.tiles[randomIndex])
      }
    }

    this.$emit('setNewTiles', newSetOfTiles)
  }
}
</script>

<style lang="scss" scoped>
.rack-container {
  display: flex;
  flex-wrap: wrap;
}
</style>
