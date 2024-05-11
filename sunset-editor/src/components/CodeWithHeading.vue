<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps({
    heading: String 
})

let locatable_code = ref()

onMounted(() => {
    let container_el = locatable_code.value
    if (props.heading)
    {
        if (!container_el.querySelector('.code-heading'))
        {
            const code_heading = document.createElement('h3')
            code_heading.innerText = props.heading
            code_heading.classList.add('code-heading')
            container_el.prepend(code_heading)
        }
    }
})
</script>

<template>
    <div class="locatable-code" ref="locatable_code">
        <slot></slot>
    </div>
</template>

<style scoped>
.locatable-code :deep(h3) {
    position: relative;
    background: var(--vt-c-indigo-dark);
    padding: 10px 20px;
    margin-bottom: -10px;
    padding-bottom: 20px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 15pt;
    text-decoration: none;
    text-wrap: pretty;
    overflow-wrap: anywhere;
}
.locatable-code :deep(pre) {
    box-shadow: 0px 0px 10px 0px black;
}
</style>