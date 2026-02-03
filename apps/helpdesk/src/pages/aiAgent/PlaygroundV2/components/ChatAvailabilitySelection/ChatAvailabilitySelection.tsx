import type React from 'react'

import RadioButton from 'pages/common/components/RadioButton'

import css from './ChatAvailabilitySelection.less'

type ChatAvailabilitySelectionProps = {
    onChange: (value: 'online' | 'offline') => void
    value: 'online' | 'offline'
}

const ChatAvailabilitySelection: React.FC<ChatAvailabilitySelectionProps> = (
    props,
) => {
    return (
        <div className={css.chatAvailabilitySelection}>
            <span className={css.label}>Availability</span>
            <RadioButton
                isSelected={props.value === 'online'}
                onChange={() => props.onChange('online')}
                label="Online"
                value="online"
            />
            <RadioButton
                isSelected={props.value === 'offline'}
                onChange={() => props.onChange('offline')}
                label="Offline"
                value="offline"
            />
        </div>
    )
}

export default ChatAvailabilitySelection
