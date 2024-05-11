<script setup lang="ts">
import { get_editor_state } from '../core/editor_state'
 
const { editor_state } = get_editor_state()

const props = defineProps({
    src: String,
    external: {
        type: Boolean,
        default: false
    },
    max_height: {
        type: Number,
        default: 180
    }
})
</script>

<template>
    <img class="adjustable-image" :src="props.external ? `${props.src}` : `${editor_state.asset_endpoint}/${props.src}`" :style="{ 'max-height': `${props.max_height}px` }">
</template>

<style scoped>
.adjustable-image {
    margin: 0px !important;
    max-width: none !important ;
    display: flex;
    justify-content: center;
    align-items: center;
    object-fit: cover !important;
    width: 100%;
}
</style>