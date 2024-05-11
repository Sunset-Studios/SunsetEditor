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
    <video class="adjustable-video" controls autoplay :style="{ margin: props.middle_align ? '0px auto' : '0px', 'max-width': `${props.width}%` }">
        <source :src="props.external ? `${props.src}` : `${editor_state.asset_endpoint}/${props.src}`">
    </video>
</template>

<style scoped>
.adjustable-video {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>