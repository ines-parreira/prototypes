import React, {ComponentProps, RefObject, useRef, useState} from 'react'
import {Popover} from 'reactstrap'
import {EmojiData, BaseEmoji} from 'emoji-mart'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import EmojiPicker from 'pages/common/components/EmojiPicker/EmojiPicker'

import css from './EmojiSelect.less'

type Props = {
    className?: string
    emoji: Maybe<string>
    onEmojiClear: () => void
    onEmojiSelect: (emoji: BaseEmoji['native']) => void
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

    return (
        <div className={classNames(css.picker, className)}>
            <span
                ref={iconRef}
                className={classNames(
                    {
                        'material-icons': !emoji,
                        [css.empty]: !emoji,
                    },
                    css.icon
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
                    container={container}
                >
                    <div className={css.popover}>
                        <EmojiPicker
                            style={{border: 'none'}}
                            onClick={(emoji: EmojiData) => {
                                setIsOpen(false)
                                if ('native' in emoji) {
                                    onEmojiSelect(emoji.native)
                                }
                            }}
                        />
                        {emoji && (
                            <Button
                                fillStyle="ghost"
                                intent="primary"
                                className={css.clearButton}
                                onClick={() => {
                                    onEmojiClear()
                                    setIsOpen(false)
                                }}
                            >
                                <ButtonIconLabel icon="clear">
                                    Clear icon
                                </ButtonIconLabel>
                            </Button>
                        )}
                    </div>
                </Popover>
            )}
        </div>
    )
}

export default EmojiSelect
