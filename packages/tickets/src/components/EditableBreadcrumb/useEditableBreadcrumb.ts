import { useRef } from 'react'

type UseEditableBreadcrumbProps = {
    value: string | null
    onChange?: (value: string) => void
}

export function useEditableBreadcrumb({
    value,
    onChange,
}: UseEditableBreadcrumbProps) {
    const subjectRef = useRef<HTMLSpanElement>(null)
    const wasMouseDownRef = useRef(false)

    const handleMouseDown = () => {
        wasMouseDownRef.current = true
    }

    const handleFocus = () => {
        if (!subjectRef.current) {
            return
        }

        if (wasMouseDownRef.current) {
            subjectRef.current.dataset.focusMethod = 'mouse'
        } else {
            subjectRef.current.dataset.focusMethod = 'keyboard'
        }
        wasMouseDownRef.current = false
    }

    const handleBlur = () => {
        if (!subjectRef.current) {
            return
        }

        delete subjectRef.current.dataset.focusMethod
        const newValue = subjectRef.current.textContent || ''

        if (onChange && newValue !== (value || '')) {
            onChange(newValue)
        }

        subjectRef.current.scrollLeft = 0
    }

    const handlePaste = (event: React.ClipboardEvent) => {
        event.preventDefault()
        const text = event.clipboardData.getData('text/plain')
        const normalized = text.replace(/[\r\n]+/g, ' ').trim()
        document.execCommand('insertText', false, normalized)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            subjectRef.current?.blur()
        }
    }

    const handleInput = () => {
        if (!subjectRef.current) {
            return
        }

        const text = subjectRef.current.textContent || ''
        const normalized = text.replace(/[\r\n]+/g, ' ')

        if (text !== normalized) {
            const selection = window.getSelection()
            const range = selection?.getRangeAt(0)
            const startOffset = range?.startOffset || 0

            subjectRef.current.textContent = normalized

            const newRange = document.createRange()
            const textNode = subjectRef.current.firstChild
            if (textNode) {
                newRange.setStart(
                    textNode,
                    Math.min(startOffset, normalized.length),
                )
                newRange.collapse(true)
                selection?.removeAllRanges()
                selection?.addRange(newRange)
            }
        }
    }

    const handleEditClick = () => {
        if (!subjectRef.current) {
            return
        }

        const element = subjectRef.current
        element.focus()

        setTimeout(() => {
            const range = document.createRange()
            const selection = window.getSelection()
            range.selectNodeContents(element)
            range.collapse(false)
            selection?.removeAllRanges()
            selection?.addRange(range)

            element.scrollLeft = element.scrollWidth
        }, 0)
    }

    return {
        subjectRef,
        handleMouseDown,
        handleFocus,
        handleBlur,
        handlePaste,
        handleKeyDown,
        handleInput,
        handleEditClick,
    }
}
