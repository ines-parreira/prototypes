import { useEffect, useRef } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { Box, ListItem, NumberField, SelectField } from '@gorgias/axiom'
import { OrderStatusEnum } from '@gorgias/convert-client'

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

type DelayOption = { id: string; label: string }

const ORDER_PLACED_DELAY_OPTIONS: DelayOption[] = [
    { id: '0', label: 'Immediate' },
    { id: '5', label: '5 minutes' },
    { id: '15', label: '15 minutes' },
    { id: '30', label: '30 minutes' },
    { id: '60', label: '1 hour' },
    { id: '240', label: '4 hours' },
    { id: '1440', label: '24 hours' },
]

const WELCOME_DELAY_OPTIONS: DelayOption[] = [
    { id: '0', label: 'Immediate' },
    { id: '5', label: '5 minutes' },
    { id: '15', label: '15 minutes' },
    { id: '30', label: '30 minutes' },
    { id: '60', label: '1 hour' },
]

const WELCOME_DEFAULT_DELAY_MINUTES = 5

const ORDER_FULFILLED_DELAY_OPTIONS: DelayOption[] = [
    { id: '5', label: '5 minutes' },
    { id: '15', label: '15 minutes' },
    { id: '30', label: '30 minutes' },
    { id: '60', label: '1 hour' },
    { id: '240', label: '4 hours' },
    { id: '1440', label: '24 hours' },
]

const DEFAULT_DELAY_MINUTES = {
    [OrderStatusEnum.OrderPlaced]: 30,
    [OrderStatusEnum.OrderFulfilled]: 60,
}

const formatMinutesLabel = (minutes: number): string => {
    if (minutes === 0) return 'Immediate'
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`
    if (minutes % 60 === 0) {
        const hours = minutes / 60
        return `${hours} hour${hours === 1 ? '' : 's'}`
    }
    return `${minutes} minutes`
}

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
        let delayOptions = ORDER_PLACED_DELAY_OPTIONS
        if (journeyType === JOURNEY_TYPES.WELCOME) {
            delayOptions = WELCOME_DELAY_OPTIONS
        } else if (targetOrderStatus === OrderStatusEnum.OrderFulfilled) {
            delayOptions = ORDER_FULFILLED_DELAY_OPTIONS
        }

        return (
            <Controller
                name={fieldName}
                control={control}
                render={({ field }) => {
                    const currentValueId =
                        field.value != null ? String(field.value) : undefined
                    const items =
                        currentValueId != null &&
                        !delayOptions.some((o) => o.id === currentValueId)
                            ? [
                                  ...delayOptions,
                                  {
                                      id: currentValueId,
                                      label: formatMinutesLabel(
                                          Number(currentValueId),
                                      ),
                                  },
                              ]
                            : delayOptions
                    const selectedOption = items.find(
                        (option) => option.id === currentValueId,
                    )

                    return (
                        <Box width="100%" flexDirection="column">
                            <SelectField
                                label="Send delay"
                                items={items}
                                value={selectedOption}
                                onChange={(option) =>
                                    field.onChange(Number(option.id))
                                }
                            >
                                {(option) => <ListItem label={option.label} />}
                            </SelectField>
                        </Box>
                    )
                }}
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
