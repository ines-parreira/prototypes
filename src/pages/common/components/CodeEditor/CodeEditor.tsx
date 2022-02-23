import React, {useRef, useState} from 'react'
import _uniqueId from 'lodash/uniqueId'
import classnames from 'classnames'
import Button, {ButtonIntent} from '../../components/button/Button'
import ButtonIconLabel from '../../components/button/ButtonIconLabel'

import Tooltip from '../Tooltip'

import css from './CodeEditor.less'
import ReactACE from './WithACEEditor/ReactACE'
import {ACEProps} from './WithACEEditor/types'

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

type Props = ACEProps & {
    title?: string
    tooltip?: string
    disabled?: boolean
}

function CodeEditor({title, tooltip, disabled, ...props}: Props) {
    const idRef = useRef(_uniqueId('code-editor-'))
    const [tooltipId] = useState(_uniqueId('code-editor-tooltip-'))
    const [editor, setEditor] = useState<any | null>(null)
    const [isHover, setIsHover] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [tooltipWrapperId] = useState(
        _uniqueId('code-editor-wrapper-tooltip-')
    )

    const onCopy = async () => {
        if (!editor) {
            return
        }
        try {
            editor.selectAll()
            editor.focus()
            if (!navigator.clipboard) {
                // We keep this because the API clipboard is only available
                // when the site is served with https
                document.execCommand('copy')
            } else {
                await navigator.clipboard.writeText(editor.getValue())
            }
            setIsCopied(true)
        } catch (err) {
            console.error(err)
        }
    }

    const onMouseEnter = () => {
        setIsHover(true)
    }

    const onMouseLeave = () => {
        setIsHover(false)
        setIsCopied(false)
    }

    return (
        <div className={css.wrapper}>
            {title && (
                <div className={css.titleWrapper}>
                    <h4 className={css.title}>{title}</h4>
                    {tooltip && (
                        <div>
                            <span id={tooltipId}>
                                <i className="material-icons">info_outline</i>
                            </span>
                            <Tooltip target={tooltipId} placement="top">
                                {tooltip}
                            </Tooltip>
                        </div>
                    )}
                </div>
            )}
            <div id={tooltipWrapperId}>
                <div
                    className={classnames({
                        [css.codeWrapper]: true,
                        [css.codeDisabled]: disabled,
                    })}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <ReactACE
                        {...props}
                        name={idRef.current}
                        editor={editor}
                        setEditor={(editor: any) => setEditor(editor)}
                    />
                    {isHover && (
                        <Button
                            onClick={onCopy}
                            className={css.copyButton}
                            intent={ButtonIntent.Secondary}
                        >
                            <ButtonIconLabel icon="content_copy">
                                {isCopied ? 'Copied!' : 'Copy'}
                            </ButtonIconLabel>
                        </Button>
                    )}
                    <div className={css.modeWrapper}>{props.mode}</div>
                </div>
            </div>
            {disabled && (
                <Tooltip target={tooltipWrapperId} placement="top">
                    Extra HTML disabled.
                </Tooltip>
            )}
        </div>
    )
}

export default CodeEditor
