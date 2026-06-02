import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { NumberField } from '@gorgias/axiom'

import { MAX_WAIT_TIME } from 'AIJourney/constants'

import { ValueWithUnitField } from '../ValueWithUnitField/ValueWithUnitField'
import type { UnitOption } from '../ValueWithUnitField/ValueWithUnitField'

const FOLLOW_UP_UNITS: UnitOption[] = [
    { id: 'hours', label: 'hr', factorToBase: 60 },
    { id: 'days', label: 'days', factorToBase: 60 * 24 },
]

const MIN_WAIT_MINUTES = 60
const MIN_WAIT_HOURS = MIN_WAIT_MINUTES / 60
const MAX_WAIT_HOURS = MAX_WAIT_TIME / 60

type FollowUpWaitHoursProps = {
    fullWidth?: boolean
    isV3Architecture?: boolean
}

export const FollowUpWaitHours = ({
    fullWidth,
    isV3Architecture,
}: FollowUpWaitHoursProps = {}) => {
    const {
        control,
        formState: { errors },
    } = useFormContext()

    const maxFollowUpMessages = useWatch({
        control,
        name: 'max_follow_up_messages',
    })

    const minFollowUpsToShow = isV3Architecture ? 1 : 2
    if (!maxFollowUpMessages || maxFollowUpMessages < minFollowUpsToShow) {
        return null
    }

    if (isV3Architecture) {
        return (
            <div style={{ width: fullWidth ? '100%' : '390px' }}>
                <ValueWithUnitField
                    fieldName="follow_up_wait_minutes"
                    label="Delay between follow-up messages"
                    caption="Time to wait between each follow-up message."
                    units={FOLLOW_UP_UNITS}
                    minBaseValue={MIN_WAIT_MINUTES}
                    maxBaseValue={MAX_WAIT_TIME}
                    unitAriaLabel="Delay between follow-up messages unit"
                />
            </div>
        )
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
