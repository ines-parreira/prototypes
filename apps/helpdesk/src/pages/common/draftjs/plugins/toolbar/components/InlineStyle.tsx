import React, { useMemo } from 'react'

import { RichUtils } from 'draft-js'

import type { ActionInjectedProps } from '../types'
import Button from './Button'

type Props = {
    icon: string
    name: string
    style: string
    isBlockType?: boolean
} & ActionInjectedProps

const InlineStyle = ({
    getEditorState,
    icon,
    name,
    setEditorState,
    style,
    isBlockType,
    isDisabled = false,
}: Props) => {
    const editorState = getEditorState()

    const isActive = useMemo(() => {
        const contentState = editorState.getCurrentContent()

        if (!contentState.hasText()) {
            return false
        }

        const currentStyle = editorState.getCurrentInlineStyle()
        return currentStyle.has(style)
    }, [editorState, style])

    const onToggle = () => {
        const editorState = getEditorState()
        setEditorState(RichUtils.toggleInlineStyle(editorState, style))
    }

    const toggleBlockType = () => {
        const editorState = getEditorState()
        const blockType = RichUtils.getCurrentBlockType(editorState)

        if (blockType === style) {
            setEditorState(
                RichUtils.onTab(
                    { preventDefault: () => {} } as any,
                    editorState,
                    4,
                ),
            )
        } else {
            setEditorState(RichUtils.toggleBlockType(editorState, style))
        }
    }

    return (
        <Button
            name={name}
            icon={icon}
            isActive={isActive}
            isDisabled={isDisabled}
            onToggle={isBlockType ? toggleBlockType : onToggle}
        />
    )
}

export default InlineStyle
