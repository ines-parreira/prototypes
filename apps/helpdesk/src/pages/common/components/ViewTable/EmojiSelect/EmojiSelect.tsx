import type { ComponentProps, MouseEvent, RefObject } from 'react'
import React, { useRef, useState } from 'react'

import classNames from 'classnames'
import type { BaseEmoji, EmojiData } from 'emoji-mart'
import { Popover } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import EmojiPicker from 'pages/common/components/EmojiPicker/EmojiPicker'

import css from './EmojiSelect.less'

type Props = {
    className?: string
    emoji: Maybe<string>
    onEmojiClear: (event: MouseEvent<HTMLButtonElement>) => void
    onEmojiSelect: (
        emoji: BaseEmoji['native'],
        event: MouseEvent<HTMLElement>,
    ) => void
} & Pick<ComponentProps<typeof Popover>, 'container'>

const EmojiSelect = ({
    className,
    container,
    emoji,
    onEmojiClear,
    onEmojiSelect,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const iconRef: RefObject<HTMLSpanElement> = useRef(null)
    const toggle = () => setIsOpen(!isOpen)
    const appNode = useAppNode()

    return (
        <div className={classNames(css.picker, className)}>
            <span
                ref={iconRef}
                className={classNames(
                    {
                        'material-icons': !emoji,
                        [css.empty]: !emoji,
                    },
                    css.icon,
                )}
                onClick={toggle}
            >
                {emoji ? emoji : 'insert_emoticon'}
            </span>
            {iconRef.current && (
                <Popover
                    isOpen={isOpen}
                    target={iconRef.current}
                    placement="bottom"
                    toggle={toggle}
                    fade={false}
                    trigger="legacy"
                    container={container ?? appNode ?? undefined}
                >
                    <div className={css.popover}>
                        <EmojiPicker
                            style={{ border: 'none' }}
                            onClick={(
                                emoji: EmojiData,
                                event: MouseEvent<HTMLElement>,
                            ) => {
                                setIsOpen(false)
                                if ('native' in emoji) {
                                    onEmojiSelect(emoji.native, event)
                                }
                            }}
                        />
                        {emoji && (
                            <Button
                                fillStyle="ghost"
                                intent="primary"
                                className={css.clearButton}
                                onClick={(
                                    event: MouseEvent<HTMLButtonElement>,
                                ) => {
                                    onEmojiClear(event)
                                    setIsOpen(false)
                                }}
                                leadingIcon="clear"
                            >
                                Clear icon
                            </Button>
                        )}
                    </div>
                </Popover>
            )}
        </div>
    )
}

export default EmojiSelect
