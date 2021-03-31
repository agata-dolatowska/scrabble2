<template lang="pug">
    div
        table
            tbody
                tr(v-for="(word, i) in savedWords" :key="i")
                    <ScoreboardItem :word="word"/>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import WordModel from '@/models/Word'
import ScoreboardItem from '@/components/ScoreboardItem.vue'

@Component({
  components: {
    ScoreboardItem
  }
})
export default class Scoreboard extends Vue {
    @Prop({ required: true }) savedWords!: WordModel[]
}
</script>
