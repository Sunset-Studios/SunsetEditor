<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ComponentListingTool from '../components/ComponentListingTool.vue'
import EditorContent from '../components/EditorContent.vue'
import { get_editor_state } from '../core/editor_state'

const props = defineProps({
    asset_endpoint: String,
    start_with_editing_enabled: Boolean,
    stylesheet_string: String
})

const { editor_state } = get_editor_state()

let editor_content = ref()

function export_document_string() {
    if (editor_content.value) {
        return editor_content.value.export_document_string()
    }
    return ''
}

function import_document_string(doc: string) {
    if (editor_content.value) {
        editor_content.value.import_document_string(doc)
    }
}

onMounted(() => {
    editor_state.value.asset_endpoint = props.asset_endpoint ?? ''
    editor_state.value.is_in_edit_mode = props.start_with_editing_enabled ?? false
    editor_state.value.stylesheet_string = props.stylesheet_string ?? ''
})

defineExpose({ export_document_string, import_document_string })
</script>

<template>
    <div class="editor">
        <EditorContent ref="editor_content"/>
        <ComponentListingTool v-if="editor_state.showing_component_listing"/>
    </div>
</template>

<style scoped>
.editor {
    position: relative; 
    width: 100%;
}
</style>