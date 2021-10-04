import React, {FunctionComponent} from 'react'
import {EditorState} from 'draft-js'

import {CODE_BLOCK, insertCodeEditor} from '../utils'

import {HelpCenterEditorToolbarButton} from './HelpCenterEditorToolbarButton'

type CodeBlockToolbarButtonProps = {
    onChange: (editorState: EditorState) => void
    editorState: EditorState
}

export const CodeBlockToolbarButton: FunctionComponent<CodeBlockToolbarButtonProps> = ({
    editorState,
    onChange,
}: CodeBlockToolbarButtonProps) => (
    <HelpCenterEditorToolbarButton
        icon="code"
        tooltip="Code snippet"
        onClick={() => {
            onChange(insertCodeEditor(editorState, CODE_BLOCK))
        }}
    />
)
