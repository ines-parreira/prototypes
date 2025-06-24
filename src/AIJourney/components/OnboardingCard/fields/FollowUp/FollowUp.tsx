import { useCallback } from 'react'

import { FieldPresentation, Info, Selector } from 'AIJourney/components'

import css from './FollowUp.less'

type FollowUpFieldProps = {
    options?: number[]
    value?: number
    onChange?: (value?: number) => void
}

export const FollowUpField = ({
    options,
    value,
    onChange,
}: FollowUpFieldProps) => {
    const followUpOptions = options || [1, 2, 3]

    const handleChange = useCallback(
        (option?: number) => {
            if (onChange) {
                return onChange(option)
            }
            return
        },
        [onChange],
    )

    return (
        <div className={css.followUpField}>
            <FieldPresentation
                name="Follow-up"
                description="Select the number of follow-ups"
            />
            <Selector
                options={followUpOptions}
                value={value}
                onChange={handleChange}
            />
            <Info content="Follow-ups are triggered every 24 hours." />
        </div>
    )
}
