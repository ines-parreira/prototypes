import React, {useState} from 'react'
import Editor from 'draft-js-plugins-editor'
import {EditorState} from 'draft-js'

import {Plugin} from '../plugins/types'

import {createEditorStateFromHtml} from './draftTestUtils'

type Props = {
    html: string
    editorState: EditorState
    plugins: Plugin[]
}

export default function TestEditor({html, editorState, plugins}: Props) {
    const [editorComponentState] = useState<EditorState>(
        editorState ? editorState : createEditorStateFromHtml(html)
    )

    return (
        <Editor
            editorState={editorComponentState}
            onChange={(editorState: EditorState) => editorState}
            plugins={plugins}
        />
    )
}
