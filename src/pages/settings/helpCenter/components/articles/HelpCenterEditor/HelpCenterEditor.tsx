import React, {useState, useEffect} from 'react'
import {isUndefined} from 'lodash'

import {Editor} from 'react-draft-wysiwyg'
import {EditorState, convertToRaw, convertFromRaw} from 'draft-js'

import {
    insertAtomicBlocksForImagesEntities,
    draftToMarkdown,
    markdownToDraft,
} from './utils'
import {toolbarConfig} from './components/HelpCenterEditorToolbar.config'
import css from './HelpCenterEditor.less'
import './react-draft-wysiwyg.css'

type Props = {
    articleId?: number
    value?: string
    onChange: (value: string) => void
}

const HelpCenterEditor = ({articleId, value = '', onChange}: Props) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty())

    const transformValueToEditorState = React.useCallback(
        (innerValue: string) => {
            const rawData = markdownToDraft(innerValue)
            const rawDataWithImagesBlocks = insertAtomicBlocksForImagesEntities(
                rawData
            )
            const contentState = convertFromRaw(rawDataWithImagesBlocks)
            const newEditorState = EditorState.createWithContent(contentState)
            setEditorState(newEditorState)
        },
        []
    )

    useEffect(() => {
        if (isUndefined(articleId)) {
            setEditorState(EditorState.createEmpty())
        } else {
            transformValueToEditorState(value)
        }
    }, [articleId])

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
