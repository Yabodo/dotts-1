<template>   
    <div>
        <h4 v-if="title" class="header">
            {{ title }}
        </h4>
        <div style="display: flex; align-items: center">
            <vs-select block :placeholder="placeholder" v-model="field">
                <vs-option v-for="(value, index) in options" :key="index" :label="capitalize(value)" :value="value">
                    {{ capitalize(value) }}
                </vs-option>
            </vs-select>
            <div v-if="submittable" @click="submit()" class="icon-button">
                <i class='bx bx-check icon'></i>
            </div>
        </div>
    </div>
</template>
<script>

export default {
  data () {
    return {
      field: this.default
    }
  },
  props: ['placeholder', 'title', 'options', 'default', 'submittable'],
  watch: {
    field() {
      this.$emit('change', this.field)
    }
  },
  methods: {
    submit() {
        this.$emit('submit', this.field)
    },
    capitalize(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  watch: {
    field () {
      this.$emit('change',this.field)
    }
  }
}
</script>