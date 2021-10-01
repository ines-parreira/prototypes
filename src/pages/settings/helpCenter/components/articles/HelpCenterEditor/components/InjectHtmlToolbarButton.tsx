import React, {FunctionComponent} from 'react'
import {EditorState} from 'draft-js'

import {INJECTED_HTML_TYPE, insertCodeEditor} from '../utils'

import {HelpCenterEditorToolbarButton} from './HelpCenterEditorToolbarButton'

type InjectHtmlToolbarButtonProps = {
    onChange: (editorState: EditorState) => void
    editorState: EditorState
}

export const InjectHtmlToolbarButton: FunctionComponent<InjectHtmlToolbarButtonProps> = ({
    editorState,
    onChange,
}: InjectHtmlToolbarButtonProps) => (
    <HelpCenterEditorToolbarButton
        icon="developer_mode"
        tooltip="Injected Code"
        onClick={() => {
            onChange(insertCodeEditor(editorState, INJECTED_HTML_TYPE))
        }}
    />
)
