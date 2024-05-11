<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    grid_spacing: {
        type: Number,
        default: 12
    }
})

let observer: MutationObserver;

let widget = ref()
let horizontal_divides = ref(props.grid_spacing)
let vertical_divides = ref(props.grid_spacing)
let max_height = ref(0)

function updateDivides() {
    const widget_width = widget.value.offsetWidth ?? 0
    const widget_height = widget.value.offsetHeight ?? 0
    horizontal_divides.value = Math.floor(widget_height / props.grid_spacing)
    vertical_divides.value = Math.floor(widget_width / props.grid_spacing)
}

function updateHeight() {
    if (observer)
    {
        observer.disconnect()
    }

    const children = widget.value.getElementsByTagName('*')
    let min_y = Number.MAX_SAFE_INTEGER;
    let max_y = Number.MIN_SAFE_INTEGER;
    for (const child of children)
    {
        const child_top_margin = parseInt(window.getComputedStyle(child).getPropertyValue('margin-top'))
        const child_bottom_margin = parseInt(window.getComputedStyle(child).getPropertyValue('margin-bottom'))
        let child_min_y = child.offsetTop - child_top_margin
        let child_max_y = child.offsetTop + child.offsetHeight + child_bottom_margin
        min_y = child_min_y < min_y ? child_min_y : min_y
        max_y = child_max_y > max_y ? child_max_y : max_y 
    }
    max_height.value = max_y - min_y

    updateDivides()
}

onMounted(() => {
    updateHeight()
    observer = new MutationObserver(updateHeight)
    observer.observe(widget.value, { childList: true, subtree: true })
    window.addEventListener('resize', updateHeight)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateHeight)
    observer.disconnect()
})
</script>

<template>
    <div class="interactive-widget" ref="widget" :style="{ height: max_height + 'px' }">
        <div class="background-grid">
            <div v-for="line in horizontal_divides" class="background-grid-line horizontal" :style="{ top: line * props.grid_spacing + 'px' }"></div>
            <div v-for="line in vertical_divides" class="background-grid-line vertical" :style="{ left: line * props.grid_spacing + 'px' }"></div>
        </div>
        <slot></slot>
    </div>
</template>

<style scoped>
.interactive-widget {
    position: relative;
    width: 100%;
    min-height: 100px;
    height: auto;
    border-radius: 5px;
    border: 1px solid var(--vt-c-indigo);
    background-color: var(--vt-c-indigo-dark);
    margin-bottom: 15px;
    z-index: 1;
    overflow: hidden;
}

.background-grid-line {
    position: absolute;
    background-color: var(--vt-c-indigo);
    z-index: 0;
}
.background-grid-line.horizontal {
    height: 1px;
    width: 100%;
}
.background-grid-line.vertical {
    height: 100%;
    width: 1px;
}
</style>