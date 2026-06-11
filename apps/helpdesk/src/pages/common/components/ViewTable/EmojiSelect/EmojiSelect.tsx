import type { ComponentProps, MouseEvent, RefObject } from 'react'
import React, { useRef, useState } from 'react'

import classNames from 'classnames'
import type { BaseEmoji, EmojiData } from 'emoji-mart'
import { Popover } from 'reactstrap'

import { Box, Button, Icon, LegacyButton } from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import { EmojiPicker } from 'pages/common/components/EmojiPicker/EmojiPicker'

import css from './EmojiSelect.less'

type Props = {
    className?: string
    emoji: Maybe<string>
    onEmojiClear: (event: MouseEvent<HTMLButtonElement>) => void
    onEmojiSelect: (
        emoji: BaseEmoji['native'],
        event: MouseEvent<HTMLElement>,
    ) => void
    triggerMode?: 'legacy' | 'axiom-button'
} & Pick<ComponentProps<typeof Popover>, 'container'>

const EmojiSelect = ({
    className,
    container,
    emoji,
    onEmojiClear,
    onEmojiSelect,
    triggerMode = 'legacy',
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const iconRef: RefObject<HTMLSpanElement> = useRef(null)
    const buttonRef: RefObject<HTMLButtonElement> = useRef(null)
    const toggle = () => setIsOpen(!isOpen)
    const appNode = useAppNode()
    const targetRef =
        triggerMode === 'axiom-button' ? buttonRef.current : iconRef.current

    return (
        <div
            className={classNames(
                {
                    [css.picker]: triggerMode === 'legacy',
                },
                className,
            )}
        >
            {triggerMode === 'axiom-button' ? (
                <Button
                    ref={buttonRef}
                    slot="button"
                    variant="secondary"
                    aria-label="View emoji"
                    icon={
                        emoji ? (
                            <Box
                                display="inline-flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                {emoji}
                            </Box>
                        ) : (
                            <Icon
                                name="emoji-smile"
                                color="content-neutral-tertiary"
                            />
                        )
                    }
                    onClick={toggle}
                />
            ) : (
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
            )}
            {targetRef && (
                <Popover
                    isOpen={isOpen}
                    target={targetRef}
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
                            <LegacyButton
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
                            </LegacyButton>
                        )}
                    </div>
                </Popover>
            )}
        </div>
    )
}

export { EmojiSelect }
