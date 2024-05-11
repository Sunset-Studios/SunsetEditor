<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { parse, HtmlGenerator } from 'latex.js' 

const props = defineProps({
    text: String,
    font_size: {
        type: Number,
        default: 16
    } 
})

let latex_wrapper = ref()

onMounted(() => {
    let generator = new HtmlGenerator({ hyphenate: false })
    let el = parse(props.text, { generator: generator })
    latex_wrapper.value.innerHTML = el.domFragment().firstElementChild.innerHTML
})
</script>

<template>
    <div class="latex-text" ref="latex_wrapper" :style="{ 'font-size': `${props.font_size}pt`, 'line-height': `${props.font_size}pt`}">
    </div>
</template>

<style scoped>
.latex-text {
    font-family: math;
    text-align: center;
    padding: 15px;
    background: #3e4b3b;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: -2px -2px 0px 0px var(--vt-c-sunset-theme-3);
    color: white;
}
.latex-text :deep(p) {
    padding: 0;
}
.latex-text :deep(.katex-html) {
    display: none;
}
</style>