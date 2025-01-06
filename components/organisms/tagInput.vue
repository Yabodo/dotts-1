<template>
  <div class='tag-input' style='display: flex; flex-direction: column;'>
    <p style="padding: 20px 10px 0px 10px">Tags</p>
    <div style="padding: 0px 10px 10px 10px;">
      <div v-for='(tag, index) in tags' :key='tag' class='tag-input__tag'>
        <span @click='removeTag(index)'>x</span>
        {{ tag }}
      </div>
    </div>
    <vs-input 
      block
      type='text' 
      placeholder="Enter a Tag and press Enter" 
      @keydown.enter='addTag' 
      @keydown.188='addTag'
      @keydown.delete='removeLastTag'
    />
  </div>
</template>
<script>
export default {
  data () {
    return {
      tags: ['hello', 'world']
    }
  },
  methods: {
    addTag (event) {
      event.preventDefault()
      var val = event.target.value.trim()
      if (val.length > 0) {
        this.tags.push(val)
        event.target.value = ''
      }
    },
    removeTag (index) {
      this.tags.splice(index, 1)
    },
    removeLastTag(event) {
      if (event.target.value.length === 0) {
        this.removeTag(this.tags.length - 1)
      }
    }
  },
}
</script>
<style scoped>
.tag-input {
  width: 100%;
  font-size: 0.9em;
  box-sizing: border-box;
  color: white;
}

.tag-input__tag {
  height: 30px;
  float: left;
  margin-right: 10px;
  background-color: #141417;
  margin-top: 10px;
  line-height: 30px;
  padding: 0 5px;
  border-radius: 5px;
  color: #eee;
}

.tag-input__tag > span {
  cursor: pointer;
  opacity: 0.75;
}

.tag-input__text {
  border: none;
  outline: none;
  font-size: 0.9em;
  line-height: 50px;
  background: none;
  color: white;
  width: 100%;
}
</style>