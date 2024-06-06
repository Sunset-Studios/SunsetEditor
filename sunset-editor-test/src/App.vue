<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SunsetEditor } from '@sunsetlearn/sunset-editor'

const theme1_style = ref(`
:root {
  color: black;
}

[contenteditable]>.active.empty::after {
  color: gray !important;
}

.components-modal-container::before {
  background-color: #616161 !important;
}

.editor-content h3 {
  color: white;
}

.editor-content .copy-button {
  color: white;
}

.divider {
  background: linear-gradient(90deg, #00000000 0%, #e8802d66, transparent 100%);
}
`)

const theme2_style = ref(`
:root {
  color: white;
}

[contenteditable]>.active.empty::after {
  color: gray !important;
}
`)

const theme3_style = ref(`
:root {
  color: #2f2647;
}

[contenteditable]>.active.empty::after {
  color: gray !important;
}

.editor-content div.active::before {
  border: 1px solid #2d65e8 !important;
}

.components-modal-container::before {
  background-color: #616161 !important;
}

.editor-content h3 {
  color: white;
}

.editor-content .copy-button {
  color: white;
}

.inline-snippet {
  background-color: #00549d !important;
  color: rgb(255 255 255) !important;
}

.divider {
  background: linear-gradient(90deg, #00000000 0%, #535bf2, transparent 100%) !important;
}
`)

const theme4_style = ref(`
:root {
  color: #f5e8cd;
}

.editor-content div.active::before {
  border: 1px solid #19ab11 !important;
}

[contenteditable]>.active.empty::after {
  color: gray !important;
}
`)

const start_content = `
# Sunset Editor


An expressive markdown editor with flexible HTML capabilities. Use &lt;inline-snippet snippet=&quot;CTRL+SHIFT+L&quot;&gt;&lt;/inline-snippet&gt; to bring up the component pallette, or start typing! Currently only supported as a Vue.js component, but it is open source and easy to extract into vanilla JS or other frameworks.


&lt;divider&gt;&lt;/divider&gt;


Some of the features included:
* Custom live Markdown editing
* Custom styles via the &lt;inline-snippet snippet=&quot;stylesheet_string&quot;&gt;&lt;/inline-snippet&gt; property
* Expressive inline HTML capabilities
* Custom components via the component pallette, with many more planned!


`

let sunset_editor = ref()
let mistral_key = ref('')

onMounted(() => {
  sunset_editor.value.import_document_string(start_content)
})
</script>

<template>
  <div class="top">
    <h3 class="heading" contenteditable="true">Sunset Studios</h3>
    <SunsetEditor
      ref="sunset_editor"
      asset_endpoint="https://static.sunsetlearn.com"
      :start_with_editing_enabled="true"
      :stylesheet_string="theme1_style"
      current_llm="mistral"
    />
  </div>
</template>

<style scoped>
.heading {
  font-size: 22pt;
  margin: 10px 0px;
  color: gray;
}
</style>
