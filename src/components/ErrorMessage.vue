<template lang="pug">
    .message
      p {{ message }}
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component
export default class ErrorMessage extends Vue {
  @Prop({ required: true }) message!: string
}
</script>
