<template>   
  <div>
    <h4 v-if="title" class="header">
      {{ title }}
    </h4>
    <input style="display: none" ref="imageInput" class="body" type="file" name="avatar" accept="image/*" @change="onImageSelect">
    <vs-button v-if="!selectedFile" block @click="$refs.imageInput.click()">
        {{ choose }}
    </vs-button>
    <div stlye="display: flex;" v-else>
        <vs-button block border @click="$refs.imageInput.click()">
          {{ selectedFile.name }}
        </vs-button>
        <vs-button block @click="submit">
          {{ save }}
      </vs-button>
      </div>
  </div>
</template>
<script>

export default {
  data () {
    return {
      tags: ['hello', 'world'],
      selectedFile: null
    }
  },
  props: ['choose', 'title', 'save'],
  methods: {
    onImageSelect(event) {
      this.selectedFile = event.target.files[0];
    },
    submit(event) {
      this.$emit('submit', this.selectedFile);
    }
  },
}
</script>