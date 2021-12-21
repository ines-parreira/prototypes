import React, {useState, useEffect} from 'react'
import Clipboard from 'clipboard'
import {Alert} from 'reactstrap'
import _uniqueId from 'lodash/uniqueId'

import Button, {ButtonIntent} from './button/Button'
import ButtonIconLabel from './button/ButtonIconLabel'
import css from './CodeSnippet.less'

type Props = {
    code: string
}

function CodeSnippet({code}: Props) {
    const [isCopied, setIsCopied] = useState(false)
    const [isHover, setIsHover] = useState(false)
    const [id] = useState(_uniqueId('code-snippet-'))

    let clipboard: Clipboard

    useEffect(() => {
        clipboard = new Clipboard(`#${id}-button`)
        clipboard.on('success', () => {
            setIsCopied(true)
        })

        return function () {
            if (clipboard) {
                clipboard.destroy()
            }
        }
    })

    const onMouseLeave = () => {
        setIsHover(false)
        setIsCopied(false)
    }

    return (
        <Alert
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={onMouseLeave}
            className={css['wrapper']}
        >
            <pre id={id} className={css.code}>
                {code}
            </pre>
            {isHover && (
                <Button
                    id={`${id}-button`}
                    className={css['copy-button']}
                    data-clipboard-target={`#${id}`}
                    intent={ButtonIntent.Secondary}
                >
                    <ButtonIconLabel icon="content_copy">
                        {isCopied ? 'Copied!' : 'Copy'}
                    </ButtonIconLabel>
                </Button>
            )}
        </Alert>
    )
}

export default CodeSnippet
