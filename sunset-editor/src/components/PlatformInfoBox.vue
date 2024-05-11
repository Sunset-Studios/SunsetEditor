<script setup lang="ts">
import { ref, onUpdated, onMounted, watch } from 'vue'
import { get_editor_state } from '../core/editor_state' 
import { wait_for_all_img_loads } from '../utility/html_utils'

const props = defineProps({
    platform: String,
    do_platform_check: {
        type: Boolean,
        default: true
    },
    auto_expand: {
        type: Boolean,
        default: false
    }
})

const { editor_state } = get_editor_state()

let unsupported = ref(false)
let is_expanded = ref(false)

let header = ref()
let content = ref()

let header_only_height = ref(0)
let content_only_height = ref(0)

function togglePlatformInfo()
{
    is_expanded.value = !is_expanded.value
}

function set_element_heights(): {}
{
    header_only_height.value = header.value?.offsetHeight ?? 0
    content_only_height.value = content.value?.offsetHeight ?? 0
    return {}
}

function set_disabled_state()
{
    if (props.platform?.includes("mac"))
    {
        unsupported.value = !editor_state.value.has_mac_support
    }
}

set_disabled_state()

watch(editor_state, (_new_editor_state: any, _old_editor_state: any) => {
    set_disabled_state()
})

onUpdated(() => {
    set_element_heights() 
    wait_for_all_img_loads(content.value, set_element_heights)
})

onMounted(() => {
    if (props.auto_expand)
    {
        is_expanded.value = true
    }
    else if (props.do_platform_check)
    {
        is_expanded.value = window.navigator.platform.startsWith(props.platform?.substring(0, 3) ?? "")
    }
    set_element_heights() 
})
</script>

<template>
    <div
        class="platform-box"
        :class="{ disabled: unsupported }"
        :style="{ 'height': !is_expanded ? (header_only_height - 15) + 'px' : (header_only_height + content_only_height + 15) + 'px', 'pointer-events': unsupported ? 'none' : 'auto' }"
    >
        <div class="header" ref="header" @click="togglePlatformInfo">
            <h3>{{ props.platform }}</h3> 
            <h4 v-if="unsupported">Coming soon</h4>
            <i class="fa-solid fa-centered" :class="{ 'fa-chevron-down': !is_expanded, 'fa-chevron-up': is_expanded }"></i>
        </div>
        <div v-if="!unsupported" class="content" ref="content">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.platform-box {
   background-color: var(--color-info);
   border-radius: 5px;
   padding: 0px 15px 15px 15px;
   margin-bottom: 15px;
   color: var(--color-background);
   transition: 0.25s all ease-in-out;
   overflow: hidden;
}
.platform-box.disabled {
    color: var(--color-background-light);
    background-color: var(--color-background-soft);
}
.platform-box .header {
    padding: 10px 0px;
    cursor: pointer;
}
.platform-box h3 {
    display: inline-block;
    font-weight: 500;
    text-decoration: none !important;
}
.platform-box h4 {
    display: inline-block;
    font-weight: 500;
    margin-left: 10px;
    color: var(--color-heading);
}
.platform-box i {
    padding: 5px;
    margin-right: 10px;
    float: right;
}
.platform-box .content {
    padding: 10px 10px 0px 10px;
    background-color: var(--color-background); 
    color: var(--color-text);
    border-radius: 5px;
    border: 1px solid var(--vt-c-dark-green);
}
</style>