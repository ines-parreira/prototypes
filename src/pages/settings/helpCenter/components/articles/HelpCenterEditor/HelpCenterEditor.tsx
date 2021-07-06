import React, {useState, useEffect} from 'react'
import {Editor} from 'react-draft-wysiwyg'
import {EditorState, convertToRaw, convertFromRaw} from 'draft-js'

import {
    insertAtomicBlocksForImagesEntities,
    draftToMarkdown,
    markdownToDraft,
} from './utils'
import {toolbarConfig} from './components/HelpCenterEditorToolbar.config'
import css from './HelpCenterEditor.less'

type Props = {
    value?: string
    onChange: (value: string) => void
}

const HelpCenterEditor = ({value = '', onChange}: Props) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty())
    useEffect(() => {
        const rawData = markdownToDraft(value)
        const rawDataWithImagesBlocks = insertAtomicBlocksForImagesEntities(
            rawData
        )
        const contentState = convertFromRaw(rawDataWithImagesBlocks)
        const newEditorState = EditorState.createWithContent(contentState)
        setEditorState(newEditorState)
    }, [])

    const onEditorChange = (editorState: EditorState) => {
        setEditorState(editorState)
        const content = editorState.getCurrentContent()
        const rawObject = convertToRaw(content)
        const markdownString = draftToMarkdown(rawObject)
        onChange(markdownString)
    }

    return (
        <Editor
            editorState={editorState as any}
            wrapperClassName={css['wrapper']}
            editorClassName={css['editor']}
            toolbarClassName={css['toolbar']}
            toolbar={toolbarConfig}
            onEditorStateChange={onEditorChange}
        />
    )
}

export default HelpCenterEditor
