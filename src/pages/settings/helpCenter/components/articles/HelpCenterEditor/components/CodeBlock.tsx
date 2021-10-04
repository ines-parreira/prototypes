import React, {
    KeyboardEvent,
    FunctionComponent,
    useEffect,
    useState,
    createRef,
} from 'react'
import classNames from 'classnames'

import {ContentBlock, ContentState} from 'draft-js'

import Prism from 'prismjs'
import 'prismjs/themes/prism.css'

import {useMeasure} from 'react-use'

import {useOnClickOutside} from '../../../../../../../pages/common/hooks/useOnClickOutside'

import {useCodeEditorContext} from '../providers/CodeEditor'

import css from './CodeBlock.less'

type CodeBlockProps = {
    block: ContentBlock
    contentState: ContentState
}

export const CodeBlock: FunctionComponent<CodeBlockProps> = ({
    block,
    contentState,
}: CodeBlockProps) => {
    const entity = contentState.getEntity(block.getEntityAt(0))
    const {code} = entity.getData()

    const {
        openBlockKey,
        saveContent,
        setBlockKey,
        removeBlockKey,
    } = useCodeEditorContext()

    const $wrapper = createRef<HTMLDivElement>()
    const [$codeWrapper, {height}] = useMeasure<HTMLPreElement>()
    const [content, setContent] = useState<string>(code)

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

    const handleOnSave = () => {
        const newContent = contentState.replaceEntityData(
            block.getEntityAt(0),
            {
                code: content,
            }
        )

        if (newContent) {
            saveContent(newContent)
        }
    }

    useOnClickOutside($wrapper, () => {
        if (isOpen) {
            removeBlockKey()
            handleOnSave()
        }
    })

    useEffect(() => {
        setContent(code)
    }, [code, isOpen])

    useEffect(() => {
        // eslint-disable-next-line
        Prism.highlightAll()
    }, [content, isOpen])

    return (
        <div ref={$wrapper} className={css.codeEditorWrapper}>
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
            {isOpen ? (
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
                        className={classNames('code-input', css.codeInput)}
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
            ) : (
                <div
                    contentEditable={false}
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
    )
}
