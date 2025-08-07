import { useCallback } from 'react'

import { FieldPresentation, Selector } from 'AIJourney/components'

import css from './MessagesToSend.less'

type MessagesToSendFieldProps = {
    value?: number
    onChange?: (value: number) => void
}

export const MessagesToSendField = ({
    value,
    onChange,
}: MessagesToSendFieldProps) => {
    const handleChange = useCallback(
        (option: number) => {
            onChange?.(option)
        },
        [onChange],
    )

    return (
        <div className={css.wrapper}>
            <FieldPresentation
                name="Total number of messages to send"
                tooltip="First message and all follow-up messages which will be sent every 24 hours."
            />
            <Selector
                options={[1, 2, 3, 4]}
                value={value}
                onChange={handleChange}
            />
        </div>
    )
}
