import { useEffect, useRef } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { NumberField } from '@gorgias/axiom'
import { OrderStatusEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES, MAX_WAIT_TIME } from 'AIJourney/constants'

import { ValueWithUnitField } from '../ValueWithUnitField/ValueWithUnitField'
import type { UnitOption } from '../ValueWithUnitField/ValueWithUnitField'

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

const MINUTES_UNITS: UnitOption[] = [
    { id: 'minutes', label: 'min', factorToBase: 1 },
    { id: 'hours', label: 'hr', factorToBase: 60 },
    { id: 'days', label: 'days', factorToBase: 60 * 24 },
    { id: 'weeks', label: 'weeks', factorToBase: 60 * 24 * 7 },
]

const DEFAULT_DELAY_MINUTES = {
    [OrderStatusEnum.OrderPlaced]: 30,
    [OrderStatusEnum.OrderFulfilled]: 60,
}

const WELCOME_DEFAULT_DELAY_MINUTES = 5

export const MinutesDelay = ({
    journeyType = JOURNEY_TYPES.POST_PURCHASE,
    isV3Architecture,
}: {
    journeyType?:
        | typeof JOURNEY_TYPES.POST_PURCHASE
        | typeof JOURNEY_TYPES.WELCOME
    isV3Architecture?: boolean
}) => {
    const {
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext()

    const targetOrderStatus = useWatch({ control, name: 'target_order_status' })

    const { fieldName, caption } = fieldProps[journeyType]

    const prevTargetOrderStatus = useRef<OrderStatusEnum | undefined>(undefined)

    useEffect(() => {
        if (!isV3Architecture) return
        const prev = prevTargetOrderStatus.current
        prevTargetOrderStatus.current = targetOrderStatus as
            | OrderStatusEnum
            | undefined

        if (prev === targetOrderStatus) return

        const defaultMinutes =
            DEFAULT_DELAY_MINUTES[targetOrderStatus as OrderStatusEnum] ??
            DEFAULT_DELAY_MINUTES[OrderStatusEnum.OrderPlaced]

        if (prev == null) {
            if (targetOrderStatus != null && getValues(fieldName) == null) {
                setValue(fieldName, defaultMinutes)
            }
            return
        }

        setValue(fieldName, defaultMinutes)
    }, [targetOrderStatus, isV3Architecture, fieldName, getValues, setValue])

    useEffect(() => {
        if (!isV3Architecture || journeyType !== JOURNEY_TYPES.WELCOME) return
        if (getValues(fieldName) == null) {
            setValue(fieldName, WELCOME_DEFAULT_DELAY_MINUTES)
        }
    }, [isV3Architecture, journeyType, fieldName, getValues, setValue])

    if (isV3Architecture) {
        return (
            <ValueWithUnitField
                fieldName={fieldName}
                label="Send delay"
                units={MINUTES_UNITS}
                minBaseValue={0}
                maxBaseValue={MAX_WAIT_TIME}
                unitAriaLabel="Send delay unit"
            />
        )
    }

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
                    style={{ width: '100%' }}
                    formatOptions={{ style: 'decimal', useGrouping: false }}
                    isInvalid={!!errors[fieldName]}
                    isRequired
                />
            )}
        />
    )
}
