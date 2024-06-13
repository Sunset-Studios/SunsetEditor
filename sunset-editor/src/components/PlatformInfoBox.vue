<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { get_editor_state } from '../core/editor_state' 
import { wait_for_all_img_loads } from '../utility/html_utils'
import { add_listener, remove_listener } from '../core/global_events'

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

let platform_box = ref()
let header = ref()
let content = ref()

let header_only_height = ref(0)
let content_only_height = ref(0)

function togglePlatformInfo(_: MouseEvent)
{
    is_expanded.value = !is_expanded.value
    if (is_expanded.value) {
        platform_box.value.style.height = `${header.value.offsetHeight + content.value.offsetHeight + 15}px`
    } else {
        platform_box.value.style.height = `${header.value.offsetHeight - 15}px`
    }
    platform_box.value.style.pointerEvents = unsupported.value ? 'none' : 'auto'
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

watch(editor_state, (_new_editor_state: any, _old_editor_state: any) => {
    set_disabled_state()
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

    set_disabled_state()

    wait_for_all_img_loads(content.value, set_element_heights)

    if (header.value) {
        add_listener(header.value, 'click', (event: MouseEvent) => {
            togglePlatformInfo(event)
        })
    }
})

</script>

<template>
    <div
        class="platform-box"
        ref="platform_box"
        :class="{ disabled: unsupported }"
    >
        <div class="header" ref="header">
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