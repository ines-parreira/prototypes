import React, {useState, useEffect} from 'react'
import _isUndefined from 'lodash/isUndefined'

import {Editor} from 'react-draft-wysiwyg'
import {EditorState, convertToRaw, convertFromRaw} from 'draft-js'

import {LocaleCode} from '../../../../../../models/helpCenter/types'

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
    locale: LocaleCode
    value?: string
    onChange: (value: string) => void
}

const HelpCenterEditor = ({articleId, locale, value = '', onChange}: Props) => {
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
        if (_isUndefined(articleId)) {
            setEditorState(EditorState.createEmpty())
        } else {
            transformValueToEditorState(value)
        }
    }, [articleId, locale])

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
