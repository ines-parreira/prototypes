import type React from 'react'

import classNames from 'classnames'

import RadioButton from 'pages/common/components/RadioButton'

import css from './ChatAvailabilitySelection.less'

type ChatAvailabilitySelectionProps = {
    onChange: (value: 'online' | 'offline') => void
    value: 'online' | 'offline'
    isDisabled?: boolean
}

const ChatAvailabilitySelection: React.FC<ChatAvailabilitySelectionProps> = (
    props,
) => {
    return (
        <div className={css.chatAvailabilitySelection}>
            <span
                className={classNames(css.label, {
                    [css.labelDisabled]: props.isDisabled,
                })}
            >
                Availability
            </span>
            <RadioButton
                isSelected={props.value === 'online'}
                onChange={() => props.onChange('online')}
                label="Online"
                value="online"
                isDisabled={props.isDisabled}
            />
            <RadioButton
                isSelected={props.value === 'offline'}
                onChange={() => props.onChange('offline')}
                label="Offline"
                value="offline"
                isDisabled={props.isDisabled}
            />
        </div>
    )
}

export default ChatAvailabilitySelection
