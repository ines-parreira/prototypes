import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { NumberField } from '@gorgias/axiom'

import { MAX_WAIT_TIME } from 'AIJourney/constants'

const MIN_WAIT_HOURS = 1
const MAX_WAIT_HOURS = MAX_WAIT_TIME / 60

export const FollowUpWaitHours = ({
    fullWidth,
}: { fullWidth?: boolean } = {}) => {
    const {
        control,
        formState: { errors },
    } = useFormContext()

    const maxFollowUpMessages = useWatch({
        control,
        name: 'max_follow_up_messages',
    })

    if (!maxFollowUpMessages || maxFollowUpMessages <= 1) {
        return null
    }

    return (
        <Controller
            name="follow_up_wait_minutes"
            control={control}
            rules={{
                validate: (value) => {
                    if (value == null || Number.isNaN(Number(value))) {
                        return 'Field is required'
                    }
                    const hours = Number(value) / 60
                    if (hours < MIN_WAIT_HOURS || hours > MAX_WAIT_HOURS) {
                        return `Please enter wait time between ${MIN_WAIT_HOURS} and ${MAX_WAIT_HOURS} hours (7 days)`
                    }
                    return true
                },
            }}
            render={({ field }) => (
                <NumberField
                    label="Delay between follow-up messages"
                    caption="Hours to wait between each follow-up message."
                    value={field.value != null ? field.value / 60 : undefined}
                    onChange={(value) =>
                        field.onChange(value != null ? value * 60 : undefined)
                    }
                    error={errors.follow_up_wait_minutes?.message as string}
                    trailingSlot={'hr'}
                    style={{ width: fullWidth ? '100%' : '390px' }}
                    formatOptions={{ style: 'decimal', useGrouping: false }}
                    isInvalid={!!errors.follow_up_wait_minutes}
                    isRequired
                />
            )}
        />
    )
}
