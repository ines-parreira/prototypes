import React, {useState, useEffect} from 'react'
import _isUndefined from 'lodash/isUndefined'

import {Editor} from 'react-draft-wysiwyg'
import {ContentBlock, EditorState} from 'draft-js'

import {LocaleCode} from '../../../../../../models/helpCenter/types'

import {
    convertToHTML,
    convertFromHTML,
    INJECTED_HTML_TYPE,
    getCharCount,
    getWordCount,
} from './utils'
import {toolbarConfig} from './components/HelpCenterEditorToolbar.config'
import css from './HelpCenterEditor.less'
import './react-draft-wysiwyg.css'
import {InjectedHTMLBlockEditor} from './components/InjectedHTMLBlockEditor'

type Props = {
    articleId?: number
    locale: LocaleCode
    value?: string
    onChange: (value: string, charCount: number, wordCount: number) => void
}

const transformValueToEditorState = (innerValue: string) =>
    EditorState.createWithContent(convertFromHTML(innerValue))

const blockRenderer = (
    contentBlock: ContentBlock,
    config: unknown,
    getEditorState: () => EditorState
) => {
    const type = contentBlock.getType()
    if (type === 'atomic') {
        const entity = getEditorState()
            .getCurrentContent()
            .getEntity(contentBlock.getEntityAt(0))
        if (entity.getType() === INJECTED_HTML_TYPE) {
            return {
                component: InjectedHTMLBlockEditor,
                editable: false,
            }
        }
    }
}

const HelpCenterEditor = ({articleId, locale, value = '', onChange}: Props) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty())

    useEffect(() => {
        if (_isUndefined(articleId)) {
            setEditorState(EditorState.createEmpty())
        } else {
            setEditorState(transformValueToEditorState(value))
        }
    }, [articleId, locale])

    useEffect(() => {
        const content = editorState.getCurrentContent()
        const htmlString = convertToHTML(content)
        const text = content.getPlainText('')
        onChange(htmlString, getCharCount(text), getWordCount(text))
    }, [editorState, onChange])

    return (
        <Editor
            editorState={editorState as any}
            wrapperClassName={css['wrapper']}
            editorClassName={css['editor']}
            toolbarClassName={css['toolbar']}
            toolbar={toolbarConfig}
            onEditorStateChange={setEditorState}
            // @ts-ignore the typing of `react-draft-wysiwyg`'s `customBlockRenderFunc` arguments prop is not correct
            customBlockRenderFunc={blockRenderer}
        />
    )
}

export default HelpCenterEditor
