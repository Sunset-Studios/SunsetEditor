<script setup lang="ts">
import { get_editor_state } from '../core/editor_state'
 
const { editor_state } = get_editor_state()
 
const props = defineProps({
    src: String,
    external: {
        type: Boolean,
        default: false
    },
    width: {
        type: Number,
        default: 100
    },
    middle_align: {
        type: Boolean,
        default: true
    }
})
</script>

<template>
    <img class="adjustable-image" :src="props.external ? `${props.src}` : `${editor_state.asset_endpoint}/${props.src}`" :style="{ margin: props.middle_align ? '0px auto' : '0px', 'max-width': `${props.width}%` }">
</template>

<style scoped>
.adjustable-image {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>

