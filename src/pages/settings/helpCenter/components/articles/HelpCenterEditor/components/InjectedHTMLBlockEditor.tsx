import React, {
    KeyboardEvent,
    FunctionComponent,
    useEffect,
    useState,
} from 'react'
import classNames from 'classnames'

import {ContentBlock, ContentState} from 'draft-js'

import Prism from 'prismjs'
import 'prismjs/themes/prism.css'

import {Button} from 'reactstrap'
import {useMeasure} from 'react-use'

import {useCodeEditorContext} from '../providers/CodeEditor'

import css from './InjectedHTMLBlockEditor.less'

type InjectedHTMLBlockEditorProps = {
    block: ContentBlock
    contentState: ContentState
}

/**
 * Edit injected html blocks in the content.
 *
 * As of now it's only a non editable block and
 * will be improved and made editable with advanced
 * content customization.
 */
export const InjectedHTMLBlockEditor: FunctionComponent<InjectedHTMLBlockEditorProps> = ({
    block,
    contentState,
}: InjectedHTMLBlockEditorProps) => {
    const entity = contentState.getEntity(block.getEntityAt(0))
    const {src} = entity.getData()

    const {
        openBlockKey,
        saveContent,
        setBlockKey,
        removeBlockKey,
        removeContent,
    } = useCodeEditorContext()

    const [$codeWrapper, {height}] = useMeasure<HTMLPreElement>()
    const [content, setContent] = useState<string>(src)
    const [isExpanded, setExpanded] = useState<boolean>(false)

    const isOpen = openBlockKey === block.getKey()

    const handleKeyDown = (evt: KeyboardEvent<HTMLTextAreaElement>) => {
        let value = content
        const selStartPos = evt.currentTarget.selectionStart

        if (evt.key === 'Tab') {
            value = `${value.substring(0, selStartPos)}    ${value.substring(
                selStartPos,
                value.length
            )}`

            evt.currentTarget.selectionStart = selStartPos + 3
            evt.currentTarget.selectionEnd = selStartPos + 4
            evt.preventDefault()

            setContent(value)
        }
    }

    const handleOnClick = () => {
        setBlockKey(block.getKey())
    }

    const handleOnClickDiscard = () => {
        setContent(src)
        removeBlockKey()
    }

    const handleOnClickSave = () => {
        const newContent = contentState.replaceEntityData(
            block.getEntityAt(0),
            {
                src: content,
            }
        )

        if (newContent) {
            saveContent(newContent)
        }
    }

    const handleOnClickDelete = () => {
        removeContent(block, contentState)
    }

    const handleOnExpand = () => {
        setExpanded(true)
    }

    const handleOnCollapse = () => {
        setExpanded(false)
    }

    useEffect(() => {
        if (isOpen) {
            setContent(src)
        }
    }, [src, isOpen])

    useEffect(() => {
        if (!isExpanded && isOpen) {
            removeBlockKey()
        }
    }, [isOpen, isExpanded, removeBlockKey])

    useEffect(() => {
        // eslint-disable-next-line
        Prism.highlightAll()
    }, [content, isOpen, isExpanded])

    const headerFragment = (
        <div className={css.codeEditorHeader} contentEditable={false}>
            <span>Custom Code Block</span>
            <span
                className="material-icons"
                style={{fontSize: 18, cursor: 'pointer'}}
                onClick={isExpanded ? handleOnCollapse : handleOnExpand}
            >
                {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
        </div>
    )

    const footerFragment = (
        <div className={css.codeEditorFooter} contentEditable={false}>
            <Button color="danger" onClick={handleOnClickDelete}>
                Delete
            </Button>

            <span>
                <Button
                    disabled={src === content}
                    className="mr-2"
                    onClick={handleOnClickDiscard}
                >
                    Discard Changes
                </Button>
                <Button
                    disabled={src === content}
                    color="success"
                    onClick={handleOnClickSave}
                >
                    Save Changes
                </Button>
            </span>
        </div>
    )

    if (!isExpanded) {
        return <div className={css.codeEditorWrapper}>{headerFragment}</div>
    }

    return (
        <div className={css.codeEditorWrapper}>
            {headerFragment}
            <div style={{position: 'relative'}}>
                {isOpen ? (
                    <>
                        <div
                            className={classNames(
                                'code-edit-container',
                                css.codeEditContainer
                            )}
                            style={{
                                height: height + 20,
                            }}
                        >
                            <textarea
                                autoFocus
                                className={classNames(
                                    'code-input',
                                    css.codeInput
                                )}
                                value={content}
                                onChange={(evt) => setContent(evt.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            {
                                // TODO: Uncomment this to highlight the editor, currently buggy:
                                // ! textarea will break long lines while the <pre> will scroll the overflow
                                /*
                                <pre
                                    className={classNames(
                                        'code-output',
                                        css.codeOutput
                                    )}
                                >
                                    <code className="language-html">{content}</code>
                                </pre>
                                */
                            }
                        </div>
                        {src !== content && (
                            <div className={css.warning}>
                                <span
                                    className={classNames(
                                        css.warningIcon,
                                        'material-icons mr-4'
                                    )}
                                >
                                    warning
                                </span>
                                <span>
                                    Custom code is not validated. Incorrect code
                                    may cause issues with the published page.
                                </span>
                            </div>
                        )}
                    </>
                ) : (
                    <div
                        className={classNames(
                            'code-edit-container',
                            css.codeEditContainer
                        )}
                        style={{
                            height: height + 20,
                        }}
                        onClick={handleOnClick}
                    >
                        <pre
                            className={classNames(
                                'code-output',
                                css.codeOutputPreview
                            )}
                        >
                            <code className="language-html">{content}</code>
                        </pre>
                    </div>
                )}
            </div>

            {footerFragment}

            {
                // ?   This block is required to calculate the height of the content.
                // ?   The wrapper needs to always be larger than the actual content
                // ?  because an overflowing content will cause issues when scrolling.
            }
            <div
                style={{
                    position: 'absolute',
                }}
            >
                <pre ref={$codeWrapper} style={{opacity: 0, zIndex: -1}}>
                    <code className="language-html">{content}</code>
                </pre>
            </div>
        </div>
    )
}
