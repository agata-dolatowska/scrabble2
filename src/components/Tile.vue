<template lang="pug">
    .tile
        p.tile-letter {{ tile.letter }}
        p.tile-points {{ tile.points }}
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop, Component } from 'vue-property-decorator'
import TileModel from '@/models/Tile'

@Component
export default class Tile extends Vue {
    @Prop() tile!: TileModel
}
</script>

<style lang="scss" scoped>
.tile {
    min-width: 50px;
    height: 50px;
    font-size: 30px;
    border: 1px solid black;
    position: relative;
    padding: 10px;
}

.tile-letter {
    margin: 0;
    text-align: center;
    line-height: 50px;
}

.tile-points {
    position: absolute;
    bottom: 2px;
    right: 5px;
    font-size: 15px;
    margin: 0;
}
</style>
