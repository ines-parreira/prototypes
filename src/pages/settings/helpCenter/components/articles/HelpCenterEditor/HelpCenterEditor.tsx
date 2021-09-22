import React, {useState, useEffect} from 'react'
import _isUndefined from 'lodash/isUndefined'

import {Editor} from 'react-draft-wysiwyg'
import {EditorState, convertToRaw, convertFromRaw} from 'draft-js'

import {LocaleCode} from '../../../../../../models/helpCenter/types'

import {
    insertAtomicBlocksForImagesEntities,
    draftToMarkdown,
    markdownToDraft,
    getCharCount,
    getWordCount,
} from './utils'
import {toolbarConfig} from './components/HelpCenterEditorToolbar.config'
import css from './HelpCenterEditor.less'
import './react-draft-wysiwyg.css'

type Props = {
    articleId?: number
    locale: LocaleCode
    value?: string
    onChange: (value: string, charCount: number, wordCount: number) => void
}

const transformValueToEditorState = (innerValue: string) => {
    const rawData = markdownToDraft(innerValue)
    const rawDataWithImagesBlocks = insertAtomicBlocksForImagesEntities(rawData)
    const contentState = convertFromRaw(rawDataWithImagesBlocks)
    const newEditorState = EditorState.createWithContent(contentState)
    return newEditorState
}

const HelpCenterEditor = ({articleId, value = '', onChange}: Props) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty())

    useEffect(() => {
        if (_isUndefined(articleId)) {
            setEditorState(EditorState.createEmpty())
        } else {
            setEditorState(transformValueToEditorState(value))
        }
    }, [articleId])

    useEffect(() => {
        const content = editorState.getCurrentContent()
        const rawObject = convertToRaw(content)
        const text = content.getPlainText('')
        onChange(
            draftToMarkdown(rawObject),
            getCharCount(text),
            getWordCount(text)
        )
    }, [editorState, onChange])

    return (
        <Editor
            editorState={editorState as any}
            wrapperClassName={css['wrapper']}
            editorClassName={css['editor']}
            toolbarClassName={css['toolbar']}
            toolbar={toolbarConfig}
            onEditorStateChange={setEditorState}
        />
    )
}

export default HelpCenterEditor
