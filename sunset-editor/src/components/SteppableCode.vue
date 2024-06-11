<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { add_listener } from '../core/global_events'

const props = defineProps({
    heading: String,
    steppable_lines: Array<string>,
    removed_lines: Array<string>
})

let locatable_code = ref()

function get_code_line_elements(parent: any) {
    if (parent) {
        return parent.querySelectorAll('.code-line')
    }
    return null
}

onMounted(() => {
    let container_el = locatable_code.value
    if (props.heading) {
        if (!container_el.querySelector('.code-heading')) {
            const code_heading = document.createElement('h3')
            code_heading.innerText = props.heading
            code_heading.classList.add('code-heading')
            container_el.prepend(code_heading)
        }
    }

    const code_lines = get_code_line_elements(container_el)

    if (props.steppable_lines) {
        let lines: number[] = []
        for (const line of props.steppable_lines) {
            if (typeof (line) === 'string') {
                const numbers = line.split('-')
                const start = parseInt(numbers[0]) ?? 0
                const end = parseInt(numbers[1]) ?? 0
                for (let i = start; i < end; ++i) {
                    lines.push(i)
                }
            }
            else {
                lines.push(parseInt(line))
            }
        }

        for (let i = 0; i < code_lines.length; ++i) {
            if (lines.includes(i + 1)) {
                code_lines[i].classList.add('important')
            }
        }

        const code_steps = container_el.querySelectorAll('.code-step')
        for (let i = 0; i < code_steps.length; ++i) {
            const code_step_icon = document.createElement('i')
            code_step_icon.classList.add('fa-solid')
            code_step_icon.classList.add('fa-file-medical')
            code_steps[i].prepend(code_step_icon)

            add_listener(code_steps[i], 'mouseover', (evt: MouseEvent) => {
                const parent_lines = get_code_line_elements((evt.target as HTMLElement).parentNode)
                if (parent_lines && lines.length > i) {
                    parent_lines[lines[i] - 1].classList.add('highlighted')
                    parent_lines[lines[i] - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }
            })
            add_listener(code_steps[i], 'mouseout', (evt: MouseEvent) => {
                const parent_lines = get_code_line_elements((evt.target as HTMLElement).parentNode)
                if (parent_lines && lines.length > i) {
                    parent_lines[lines[i] - 1].classList.remove('highlighted')
                }
            })
        }
    }

    if (props.removed_lines) {
        let lines: number[] = []
        for (const line of props.removed_lines) {
            if (typeof (line) === 'string') {
                const numbers = line.split('-')
                const start = parseInt(numbers[0]) ?? 0
                const end = parseInt(numbers[1]) ?? 0
                for (let i = start; i < end; ++i) {
                    lines.push(i)
                }
            }
            else {
                lines.push(parseInt(line))
            }
        }
        for (let i = 0; i < code_lines.length; ++i) {
            if (lines.includes(i + 1)) {
                code_lines[i].classList.add('removed')
            }
        }
        const code_nukes = container_el.querySelectorAll('.code-nuke')
        for (let i = 0; i < code_nukes.length; ++i) {
            const code_step_icon = document.createElement('i')
            code_step_icon.classList.add('fa-solid')
            code_step_icon.classList.add('fa-file-excel')
            code_nukes[i].prepend(code_step_icon)

            add_listener(code_nukes[i], 'mouseover', (evt: MouseEvent) => {
                const parent_lines = get_code_line_elements((evt.target as HTMLElement).parentNode)
                if (lines.length > i) {
                    parent_lines[lines[i] - 1].classList.add('highlighted')
                }
            })
            add_listener(code_nukes[i], 'mouseout', (evt: MouseEvent) => {
                const parent_lines = get_code_line_elements((evt.target as HTMLElement).parentNode)
                if (lines.length > i) {
                    parent_lines[lines[i] - 1].classList.remove('highlighted')
                }
            })
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
    font-size: 15pt !important;
    text-decoration: none !important;
    text-wrap: pretty;
    overflow-wrap: anywhere;
}

.locatable-code :deep(.code-line) {
    transition: 0.2s all;
}

.locatable-code :deep(.code-line.important) {
    border-left: 3px solid var(--vt-c-active-green);
    border-radius: 3px;
    padding: 0px 5px;
}

.locatable-code :deep(.code-line.removed) {
    border-left: 3px solid var(--vt-c-sunset-theme-4);
    border-radius: 3px;
    padding: 0px 5px;
}

.locatable-code :deep(.code-line.important.highlighted) {
    background-color: rgb(32 158 116 / 42%);
}

.locatable-code :deep(.code-line.removed.highlighted) {
    background-color: rgba(158, 40, 32, 0.42);
}

.locatable-code :deep(.code-step),
.locatable-code :deep(.code-nuke) {
    position: relative;
    border: 1px dashed var(--vt-c-active-green);
    border-radius: 5px;
    padding: 5px;
    margin-bottom: 10px;
}

.locatable-code :deep(.code-nuke) {
    border: 1px dashed var(--vt-c-sunset-theme-4);
}

.locatable-code :deep(.code-step i),
.locatable-code :deep(.code-nuke i) {
    position: absolute;
    color: var(--vt-c-active-green);
    padding-right: 5px;
    font-size: 16px;
    top: -3px;
    right: -5px;
}

.locatable-code :deep(.code-nuke i) {
    color: var(--vt-c-sunset-theme-4);
}

.locatable-code :deep(.code-step p),
.locatable-code :deep(.code-nuke p) {
    padding: 5px;
}

.locatable-code :deep(pre) {
    position: sticky !important;
    top: 75px;
    z-index: 3;
    text-wrap: pretty;
    overflow-wrap: anywhere;
    box-shadow: 0px 0px 10px 0px black;
}
</style>