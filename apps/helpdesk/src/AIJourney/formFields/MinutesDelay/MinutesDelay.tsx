import { Controller, useFormContext } from 'react-hook-form'

import { NumberField } from '@gorgias/axiom'

import { JOURNEY_TYPES, MAX_WAIT_TIME } from 'AIJourney/constants'

const fieldProps = {
    [JOURNEY_TYPES.POST_PURCHASE]: {
        fieldName: 'post_purchase_wait_minutes',
        caption: 'Minutes to wait after the order event before messaging.',
    },
    [JOURNEY_TYPES.WELCOME]: {
        fieldName: 'wait_time_minutes',
        caption:
            'Minutes to wait after the SMS consent event before messaging.',
    },
}

export const MinutesDelay = ({
    journeyType = JOURNEY_TYPES.POST_PURCHASE,
}: {
    journeyType?:
        | typeof JOURNEY_TYPES.POST_PURCHASE
        | typeof JOURNEY_TYPES.WELCOME
}) => {
    const {
        control,
        formState: { errors },
    } = useFormContext()

    const { fieldName, caption } = fieldProps[journeyType]

    return (
        <Controller
            name={fieldName}
            control={control}
            rules={{
                validate: (value) => {
                    const numValue = Number(value)
                    if (numValue > MAX_WAIT_TIME) {
                        return `Please enter wait time between 0 and ${MAX_WAIT_TIME} minutes (7 days)`
                    }
                    return true
                },
            }}
            render={({ field }) => (
                <NumberField
                    label="Delay before first message"
                    caption={caption}
                    value={field.value ?? undefined}
                    onChange={(value) => field.onChange(value ?? undefined)}
                    minValue={0}
                    error={errors[fieldName]?.message as string}
                    trailingSlot={'min'}
                    style={{ width: '390px' }}
                    formatOptions={{ style: 'decimal', useGrouping: false }}
                    isInvalid={!!errors[fieldName]}
                    isRequired
                />
            )}
        />
    )
}
