import React, { ComponentType, useEffect, useRef, useState } from 'react'

import { useId } from '@repo/hooks'
import Clipboard from 'clipboard'

import { LegacyButton as Button } from '@gorgias/axiom'

import css from './withClipboardButton.less'

export function withClipboardButton(
    Component: ComponentType<any>,
    idPrefix: string,
) {
    function WithClipboardComponent(props: any) {
        const [isCopied, setIsCopied] = useState(false)
        const [isHover, setIsHover] = useState(false)
        const randomId = useId()
        const id = idPrefix + randomId
        const clipboardRef = useRef<ClipboardJS | null>(null)

        useEffect(() => {
            clipboardRef.current = new Clipboard(`#${id}-button`)
            clipboardRef.current.on('success', () => {
                setIsCopied(true)
            })

            return function () {
                if (clipboardRef.current) {
                    clipboardRef.current.destroy()
                }
            }
        })

        const onMouseLeave = () => {
            setIsHover(false)
            setIsCopied(false)
        }

        const onMouseEnter = () => {
            setIsHover(true)
        }

        return (
            <div
                className={css.container}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <Component {...props} id={id} />
                {isHover && (
                    <Button
                        id={`${id}-button`}
                        className={css['copy-button']}
                        data-clipboard-target={`#${id}`}
                        intent="secondary"
                        leadingIcon="content_copy"
                    >
                        {isCopied ? 'Copied!' : 'Copy'}
                    </Button>
                )}
            </div>
        )
    }

    return WithClipboardComponent
}
