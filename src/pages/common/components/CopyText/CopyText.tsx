import classNames from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import React from 'react'

import useCopyToClipboard from 'hooks/useCopyToClipboard'

import IconButton from '../button/IconButton'
import css from './CopyText.less'
import {selectText} from './utils'

export type CopyTextProps = {
    text: string
    className?: string
}

const CopyText = ({text, className}: CopyTextProps) => {
    const [, copyToClipboard] = useCopyToClipboard()
    const textId = _uniqueId(`copy-text`)

    const handleCopyCode = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.stopPropagation()
        copyToClipboard(text)
        selectText(textId)
    }

    return (
        <div className={classNames(css.container, className)}>
            <div className={css.copyText} id={textId}>
                {text}
            </div>
            <IconButton
                fillStyle="ghost"
                intent="secondary"
                onClick={(e) => handleCopyCode(e)}
                className={css.copyButton}
            >
                content_copy
            </IconButton>
        </div>
    )
}

export default CopyText
