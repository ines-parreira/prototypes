import React, {useState, useEffect} from 'react'
import _isUndefined from 'lodash/isUndefined'

import {Editor} from 'react-draft-wysiwyg'
import {
    ContentBlock,
    ContentState,
    EditorState,
    Modifier,
    RichUtils,
    DraftEditorCommand,
    SelectionState,
} from 'draft-js'

import {LocaleCode} from '../../../../../../models/helpCenter/types'

import {
    convertToHTML,
    convertFromHTML,
    INJECTED_HTML_TYPE,
    VIDEO_TYPE,
    getCharCount,
    getWordCount,
    CODE_BLOCK,
} from './utils'
import {toolbarConfig} from './components/HelpCenterEditorToolbar.config'
import {InjectedHTMLBlockEditor} from './components/InjectedHTMLBlockEditor'
import {CodeBlock} from './components/CodeBlock'
import {CodeBlockToolbarButton} from './components/CodeBlockToolbarButton'
import {InjectHtmlToolbarButton} from './components/InjectHtmlToolbarButton'
import {CodeEditorContext} from './providers/CodeEditor'
import {CustomVideoButton} from './components/HelpCenterEditorToolbarVideo'
import {VideoBlockEditor} from './components/VideoBlockEditor'

import css from './HelpCenterEditor.less'
import './react-draft-wysiwyg.css'

type Props = {
    articleId?: number
    locale: LocaleCode
    value?: string
    onChange: (value: string, charCount: number, wordCount: number) => void
}

const transformValueToEditorState = (innerValue: string) =>
    EditorState.createWithContent(convertFromHTML(innerValue))

const HelpCenterEditor = ({articleId, locale, value = '', onChange}: Props) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty())
    const [openBlockKey, setOpenBlockKey] = useState('')

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

    const onCodeEditorChange = (fragment: ContentState) => {
        const newEditorState = EditorState.set(editorState, {
            currentContent: fragment,
        })
        setEditorState(newEditorState)
        setOpenBlockKey('')
    }

    const onVideoEditorDelete = (
        atomicBlock: ContentBlock,
        fragment: ContentState
    ) => {
        // Remove entities of current atomic block
        const withoutAtomicEntity = Modifier.removeRange(
            fragment,
            new SelectionState({
                anchorKey: atomicBlock.getKey(),
                anchorOffset: 0,
                focusKey: atomicBlock.getKey(),
                focusOffset: atomicBlock.getLength(),
            }),
            'backward'
        )

        // Remove atomic block by overriding the current Immutable ContentState
        const blockMap = withoutAtomicEntity
            .getBlockMap()
            .delete(atomicBlock.getKey())
        const withoutAtomic = withoutAtomicEntity.merge({
            blockMap,
            selectionAfter: fragment.getSelectionAfter(),
        }) as ContentState

        const nextState = EditorState.push(
            editorState,
            withoutAtomic,
            'remove-range'
        )

        setEditorState(nextState)
    }

    const onCodeEditorDelete = (
        atomicBlock: ContentBlock,
        fragment: ContentState
    ) => {
        // Remove entities of current atomic block
        const withoutAtomicEntity = Modifier.removeRange(
            fragment,
            new SelectionState({
                anchorKey: atomicBlock.getKey(),
                anchorOffset: 0,
                focusKey: atomicBlock.getKey(),
                focusOffset: atomicBlock.getLength(),
            }),
            'backward'
        )

        // Remove atomic block by overriding the current Immutable ContentState
        const blockMap = withoutAtomicEntity
            .getBlockMap()
            .delete(atomicBlock.getKey())
        const withoutAtomic = withoutAtomicEntity.merge({
            blockMap,
            selectionAfter: fragment.getSelectionAfter(),
        }) as ContentState

        const nextState = EditorState.push(
            editorState,
            withoutAtomic,
            'remove-range'
        )

        setEditorState(nextState)
        setOpenBlockKey('')
    }

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

            if (entity.getType() === CODE_BLOCK) {
                return {
                    editable: true,
                    component: CodeBlock,
                }
            }

            if (entity.getType() === INJECTED_HTML_TYPE) {
                return {
                    component: InjectedHTMLBlockEditor,
                    editable: true,
                }
            }
            if (entity.getType() === VIDEO_TYPE) {
                return {
                    component: VideoBlockEditor,
                    editable: false,
                    props: {
                        onDelete: onVideoEditorDelete,
                    },
                }
            }
        }
    }

    return (
        <CodeEditorContext.Provider
            value={{
                openBlockKey,
                setBlockKey: setOpenBlockKey,
                removeBlockKey: () => setOpenBlockKey(''),
                saveContent: onCodeEditorChange,
                removeContent: onCodeEditorDelete,
            }}
        >
            <Editor
                readOnly={openBlockKey !== ''}
                editorState={editorState as any}
                wrapperClassName={css['wrapper']}
                editorClassName={css['editor']}
                toolbarClassName={css['toolbar']}
                toolbar={toolbarConfig}
                onEditorStateChange={setEditorState}
                toolbarCustomButtons={[
                    <CodeBlockToolbarButton
                        key="codeBlock"
                        onChange={setEditorState}
                        editorState={editorState}
                    />,
                    <InjectHtmlToolbarButton
                        key="injectHtml"
                        onChange={setEditorState}
                        editorState={editorState}
                    />,
                    <CustomVideoButton
                        key="custom-video-button"
                        onChange={setEditorState}
                        editorState={editorState}
                    />,
                ]}
                handleKeyCommand={(
                    command: DraftEditorCommand,
                    state: EditorState
                ) => {
                    // ?   Handle the backspace to delete the custom widget.
                    // ? Without this the backspace command will only be able to delete
                    // ? text inside the editor, not the custom widget blocks.
                    if (command === 'backspace') {
                        const nextState = RichUtils.handleKeyCommand(
                            state,
                            command
                        )
                        if (nextState) {
                            setEditorState(nextState)
                            return 'handled'
                        }
                    }

                    return 'not-handled'
                }}
                // @ts-ignore the typing of `react-draft-wysiwyg`'s `customBlockRenderFunc` arguments prop is not correct
                customBlockRenderFunc={blockRenderer}
            />
        </CodeEditorContext.Provider>
    )
}

export default HelpCenterEditor
