import React, {useState, useEffect, useRef, ComponentType} from 'react'
import Clipboard from 'clipboard'

import useId from 'hooks/useId'

import Button from '../../components/button/Button'
import ButtonIconLabel from '../../components/button/ButtonIconLabel'
import css from './withClipboardButton.less'

export function withClipboardButton(
    Component: ComponentType<any>,
    idPrefix: string
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
                    >
                        <ButtonIconLabel icon="content_copy">
                            {isCopied ? 'Copied!' : 'Copy'}
                        </ButtonIconLabel>
                    </Button>
                )}
            </div>
        )
    }

    return WithClipboardComponent
}
