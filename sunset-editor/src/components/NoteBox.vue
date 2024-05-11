<script setup lang="ts">
const props = defineProps({
    message: String,
    color: String
})
</script>

<template>
    <div class="note-box" :style="{ 'background-color': props.color ?? 'var(--color-note)' }">
        <i class="fa-solid fa-info-circle"></i>{{ props.message }}
        <slot></slot>
    </div>
</template>

<style scoped>
.note-box {
   border-radius: 5px;
   padding: 25px;
   margin: 15px 0px;
}
.note-box i {
    margin-right: 10px;
    font-size: 14pt;
}
.note-box:deep(p) {
    display: inline;
}
</style>