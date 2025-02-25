import {zodResolver} from '@hookform/resolvers/zod'

import React from 'react'
import {FormProvider, useForm} from 'react-hook-form'
import {z} from 'zod'

import useAppDispatch from 'hooks/useAppDispatch'
import {SalesSettingsData} from 'models/aiAgent/types'
import {DiscountStrategy} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {PersuasionLevel} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import {useAiAgentStoreConfigurationContext} from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import {formatDiscountMax} from 'pages/aiAgent/utils/sales-discount.utils'
import Alert from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import IconInput from 'pages/common/forms/input/IconInput'
import InputField from 'pages/common/forms/input/InputField'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import css from './SalesSettings.less'

const salesSchema = z
    .object({
        salesPersuasionLevel: z.nativeEnum(PersuasionLevel),
        salesDiscountStrategyLevel: z.nativeEnum(DiscountStrategy),
        salesDiscountMax: z.number().optional(),
    })
    .refine(
        (data) => {
            if (
                data.salesDiscountStrategyLevel === DiscountStrategy.NoDiscount
            ) {
                // Allow only 0 when discount strategy is NoDiscount
                return data.salesDiscountMax === 0
            }
            // Enforce range 1-100 for other discount strategies
            return (
                data.salesDiscountMax !== undefined &&
                data.salesDiscountMax >= 1 &&
                data.salesDiscountMax <= 100
            )
        },
        {
            message: 'Must be a number between 1 and 100',
            path: ['salesDiscountMax'],
        }
    )

export const SalesSettings = () => {
    const dispatch = useAppDispatch()
    const {storeConfiguration, updateStoreConfiguration} =
        useAiAgentStoreConfigurationContext()

    const methods = useForm<SalesSettingsData>({
        values: {
            salesPersuasionLevel:
                storeConfiguration?.salesPersuasionLevel ??
                PersuasionLevel.Moderate,
            salesDiscountStrategyLevel:
                storeConfiguration?.salesDiscountStrategyLevel ??
                DiscountStrategy.Balanced,
            salesDiscountMax: formatDiscountMax(
                (storeConfiguration?.salesDiscountMax ?? 0) * 100
            ),
        },
        mode: 'onChange',
        resolver: zodResolver(salesSchema),
    })

    const {
        watch,
        handleSubmit,
        setValue,
        reset,
        formState: {errors},
    } = methods

    const salesPersuasionLevel = watch('salesPersuasionLevel')
    const salesDiscountStrategyLevel = watch('salesDiscountStrategyLevel')
    const salesDiscountMax = watch('salesDiscountMax')

    const onSave = async () => {
        try {
            if (storeConfiguration) {
                await updateStoreConfiguration({
                    ...storeConfiguration,
                    salesPersuasionLevel,
                    salesDiscountStrategyLevel,
                    salesDiscountMax: salesDiscountMax
                        ? salesDiscountMax / 100
                        : null,
                })
            }
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to save sales configuration state',
                })
            )
        }
    }

    const onCancel = () => {
        reset()
    }

    return (
        <FormProvider {...methods}>
            <h1 className={css.salesSettingsTitle}>Sales settings</h1>
            <div className={css.salesSettingsContent}>
                <Alert icon className={css.info}>
                    Fine-tune how your AI Agent engages in sales to align with
                    your strategy.
                </Alert>

                {/* TODO update inputs to real one */}
                <input
                    data-testid="discount-strategy"
                    value={salesDiscountStrategyLevel}
                    onChange={(e) =>
                        setValue(
                            'salesDiscountStrategyLevel',
                            e.target.value as DiscountStrategy
                        )
                    }
                />
                <input value={salesPersuasionLevel} onChange={() => {}} />
                <InputField
                    type="number"
                    min={1}
                    max={100}
                    value={salesDiscountMax}
                    data-testid="discount-max"
                    onChange={(value: string) => {
                        const parsedValue = Number(value)
                        setValue(
                            'salesDiscountMax',
                            !value || isNaN(parsedValue) ? 0 : parsedValue,
                            {
                                shouldValidate: true,
                                shouldDirty: true,
                            }
                        )
                    }}
                    suffix={<IconInput icon="percent" />}
                    error={errors.salesDiscountMax?.message}
                    isDisabled={
                        salesDiscountStrategyLevel ===
                        DiscountStrategy.NoDiscount
                    }
                />
                <div className={css.contentActions}>
                    <Button onClick={handleSubmit(onSave)}>Save</Button>
                    <Button intent="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </div>
        </FormProvider>
    )
}
