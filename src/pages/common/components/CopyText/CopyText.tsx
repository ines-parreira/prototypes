import React from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useCopyToClipboard} from 'react-use'
import _uniqueId from 'lodash/uniqueId'

import classNames from 'classnames'
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
