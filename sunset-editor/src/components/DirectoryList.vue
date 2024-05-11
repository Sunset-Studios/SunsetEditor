<script setup lang="ts">
import { ref, onMounted } from 'vue'

let list_container = ref()

onMounted(() => {
    let all_li_elements = list_container.value?.getElementsByTagName('li')
    for (let li_el of all_li_elements) {
        if (!li_el.classList.contains('directory-item')) {
            const fa_icon = document.createElement('i')
            fa_icon.classList.add('fa-solid', 'fa-note-sticky', 'centered-icon')
            li_el.classList.add('directory-item')
            li_el.prepend(fa_icon)
        }
    }
})
</script>

<template>
    <div class="directory-list" ref="list_container">
        <slot></slot>
    </div>
</template>

<style scoped>
.directory-list :deep(ul) {
    padding-bottom: 0px;
}
.directory-list > :deep(ul) {
    background-color: var(--vt-c-indigo-dark);
    padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 5px;
}
.directory-list :deep(ul) li {
    position: relative;
}
.directory-list :deep(ul) i {
    left: 0;
    top: 0;
    transform: translateY(25%);
    margin: 0px -25px;
    color: var(--vt-c-active-green);
}
.directory-list :deep(ul) li::marker {
    content: '';
}
</style>