// @flow
//$FlowFixMe
import React, {useRef, useState} from 'react'
import {Button, Popover} from 'reactstrap'
import classNames from 'classnames'

import EmojiPicker from '../../EmojiPicker'

import css from './EmojiSelect.less'

type Props = {
    emoji: ?string,
    className?: string,
    onEmojiSelect: (string) => void,
    onEmojiClear: () => void,
}

const EmojiSelect = (props: Props) => {
    const {emoji, className, onEmojiSelect, onEmojiClear} = props
    const [isOpen, setIsOpen] = useState(false)
    const iconRef = useRef()
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
                >
                    <div className={css.popover}>
                        <EmojiPicker
                            style={{border: 'none'}}
                            onClick={({native}) => {
                                setIsOpen(false)
                                onEmojiSelect(native)
                            }}
                        />
                        {emoji && (
                            <Button
                                color="link"
                                className={css.clearButton}
                                onClick={() => {
                                    onEmojiClear()
                                    setIsOpen(false)
                                }}
                            >
                                <span className={css.clearInner}>
                                    <i className="icon material-icons">clear</i>{' '}
                                    Clear icon
                                </span>
                            </Button>
                        )}
                    </div>
                </Popover>
            )}
        </div>
    )
}

export default EmojiSelect
