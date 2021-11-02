<template>
  <div>
    <ab-custom-form></ab-custom-form>
  </div>
</template>

<script>

import bpmService from '@/service/bpm/bpmService'
import formService from '@/service/form/formService'

export default {
  name: 'customform',
  data() {
    return {

    }
  },
  created() {
    const html = `<input v-model="a" @change="aa(a)" />`
    const data = {
      a: 123
    }
    const methods = {
      aa: val => {
        console.log(val)
      }
    }
    formService.initCustFormFu(html, data, methods)
  }
}
</script>

<style>

</style>