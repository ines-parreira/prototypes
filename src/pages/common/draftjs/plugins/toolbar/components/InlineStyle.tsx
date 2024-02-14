import React, {useMemo} from 'react'
import {RichUtils} from 'draft-js'

import {ActionInjectedProps} from '../types'

import Button from './Button'

type Props = {
    icon: string
    name: string
    style: string
} & ActionInjectedProps

const InlineStyle = ({
    getEditorState,
    icon,
    name,
    setEditorState,
    style,
}: Props) => {
    const isActive = useMemo(() => {
        const editorState = getEditorState()
        const contentState = editorState.getCurrentContent()

        if (!contentState.hasText()) {
            return false
        }

        const currentStyle = editorState.getCurrentInlineStyle()
        return currentStyle.has(style)
    }, [getEditorState, style])

    const onToggle = () => {
        const editorState = getEditorState()
        setEditorState(RichUtils.toggleInlineStyle(editorState, style))
    }

    return (
        <Button
            name={name}
            icon={icon}
            isActive={isActive}
            isDisabled={false}
            onToggle={onToggle}
        />
    )
}

export default InlineStyle
