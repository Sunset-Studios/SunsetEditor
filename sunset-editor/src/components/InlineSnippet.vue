<script setup lang="ts">
const props = defineProps({
    snippet: String 
})
</script>

<template>
    <div class="inline-snippet">
        {{ props.snippet }}
    </div>
</template>

<style scoped>
.inline-snippet {
    background-color: var(--vt-c-indigo-dark);
    border-radius: 5px;
    padding: 1px 10px;
    margin: 0px 5px;
    display: inline;
    font-family: monospace;
    border: 1px solid var(--color-border);
    color: var(--vt-c-active-green);
}
</style>