<template>
  <div>
    <h1 v-if="error.statusCode === 404">{{ $t('pages.support.error.index.404') }}</h1>
    <h1 v-else>{{ $t('pages.support.error.index.otherError') }}</h1>
    <nuxt-link to:="/"><p>{{ $t('pages.support.error.index.returnHome') }}</p></nuxt-link>
  </div>
</template>

<script>
  export default {
    layout: 'empty',
    props: ['error'],
  }
</script>