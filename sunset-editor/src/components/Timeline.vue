<script setup lang="ts">
import { ref, onMounted } from 'vue'

let timeline_container = ref()

onMounted(() => {
    let all_li_elements = timeline_container.value?.getElementsByTagName('li')
    for (let li_el of all_li_elements) {
        if (!li_el.classList.contains('timeline-item')) {
            const fa_icon = document.createElement('i')
            fa_icon.classList.add('fa-solid', 'fa-clock')
            li_el.classList.add('timeline-item')
            li_el.prepend(fa_icon)
        }
    }
})
</script>

<template>
    <div class="timeline-list" ref="timeline_container">
        <slot></slot>
    </div>
</template>

<style scoped>
.timeline-list :deep(.timeline-item)
{
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
.timeline-list :deep(ul) {
    padding-left: 0px;
    padding-bottom: 0px;
}
.timeline-list > :deep(ul) {
    padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 5px;
}
.timeline-list :deep(ul) li {
    position: relative;
}
.timeline-list :deep(ul) i {
    color: var(--vt-c-active-green);
}
.timeline-list :deep(ul) li::marker {
    content: '';
}
.timeline-list :deep(.timeline-item::before), .timeline-list :deep(.timeline-item::after)
{
    width: 3px;
    height: 10px;
    background-color: var(--vt-c-sunset-theme-5);
    content: '';
    display: block;
    position: relative;
}
.timeline-list :deep(.timeline-item p) {
    width: 100%;
}
.timeline-list :deep(em) {
    display: block;
    text-align: left;
    font-style: normal;
}
.timeline-list :deep(em::before) {
    content: "+ ";
    font-family: fantasy;
    font-weight: 800;
    font-size: 14pt;
    border-right: 1px solid var(--vt-c-sunset-theme-5);
    margin-right: 5px;
    padding: 5px;
}
</style>