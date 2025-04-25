import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Label, Skeleton } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
import { SalesSettingsData } from 'models/aiAgent/types'
import { CHANGES_SAVED_SUCCESS } from 'pages/aiAgent/constants'
import { OnboardingSteppedSlider } from 'pages/aiAgent/Onboarding/components/OnboardingSteppedSlider/OnboardingSteppedSlider'
import {
    DiscountStrategy,
    DiscountStrategyLabels,
    DiscountStrategySteps,
} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {
    PersuasionLevel,
    PersuasionLevelLabels,
    PersuasionLevelSteps,
} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { formatDiscountMax } from 'pages/aiAgent/utils/sales-discount.utils'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import IconInput from 'pages/common/forms/input/IconInput'
import InputField from 'pages/common/forms/input/InputField'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

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
        },
    )

export const SalesSettings = () => {
    const dispatch = useAppDispatch()
    const { storeConfiguration, isLoading, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()

    const methods = useForm<SalesSettingsData>({
        values: {
            salesPersuasionLevel:
                storeConfiguration?.salesPersuasionLevel ??
                PersuasionLevel.Moderate,
            salesDiscountStrategyLevel:
                storeConfiguration?.salesDiscountStrategyLevel ??
                DiscountStrategy.NoDiscount,
            salesDiscountMax: formatDiscountMax(
                (storeConfiguration?.salesDiscountStrategyLevel ===
                DiscountStrategy.NoDiscount
                    ? 0
                    : (storeConfiguration?.salesDiscountMax ?? 0)) * 100,
            ),
        },
        mode: 'onChange',
        resolver: zodResolver(salesSchema),
    })

    const {
        watch,
        handleSubmit,
        setValue,
        trigger,
        reset,
        formState: { errors, isDirty },
    } = methods

    const salesPersuasionLevel = watch('salesPersuasionLevel')
    const salesDiscountStrategyLevel = watch('salesDiscountStrategyLevel')
    const salesDiscountMax = watch('salesDiscountMax')

    const handleSliderChange = (
        field: keyof SalesSettingsData,
        value: PersuasionLevel | DiscountStrategy | number,
    ) => {
        setValue(field, value, { shouldValidate: true, shouldDirty: true })
        if (
            field === 'salesDiscountStrategyLevel' &&
            value === DiscountStrategy.NoDiscount
        ) {
            setValue('salesDiscountMax', 0, {
                shouldValidate: true,
                shouldDirty: true,
            })
        }
        if (
            field === 'salesDiscountStrategyLevel' &&
            value !== DiscountStrategy.NoDiscount &&
            !salesDiscountMax
        ) {
            setValue('salesDiscountMax', 8, {
                shouldValidate: true,
                shouldDirty: true,
            })
        }
        if (field === 'salesDiscountStrategyLevel') {
            void trigger('salesDiscountMax')
        }
    }

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

                void dispatch(
                    notify({
                        message: CHANGES_SAVED_SUCCESS,
                        status: NotificationStatus.Success,
                    }),
                )
            }
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to save sales configuration state',
                }),
            )
        }
    }

    const onChangeDiscountMax = (value: string) => {
        if (value === '') {
            setValue('salesDiscountMax', value as any, {
                shouldValidate: false,
                shouldDirty: true,
            })
            return
        }

        const parsedValue = Number(value)
        setValue(
            'salesDiscountMax',
            !value || isNaN(parsedValue) ? 0 : parsedValue,
            {
                shouldValidate: true,
                shouldDirty: true,
            },
        )

        if (parsedValue === 0) {
            setValue(
                'salesDiscountStrategyLevel',
                DiscountStrategy.NoDiscount,
                {
                    shouldValidate: true,
                    shouldDirty: true,
                },
            )
            void trigger('salesDiscountMax')
        }
    }

    const hasChanges =
        (!!storeConfiguration?.salesDiscountMax &&
            storeConfiguration.salesDiscountMax !== salesDiscountMax / 100) ||
        storeConfiguration?.salesDiscountStrategyLevel !==
            salesDiscountStrategyLevel ||
        storeConfiguration?.salesPersuasionLevel !== salesPersuasionLevel

    if (isLoading) {
        return (
            <div className={css.salesSettingsContent}>
                <div className={css.settings}>
                    <Skeleton width={730} height={200} />
                    <Skeleton width={730} height={250} />
                </div>
            </div>
        )
    }

    return (
        <>
            <UnsavedChangesPrompt
                onSave={handleSubmit(onSave)}
                when={isDirty}
                onDiscard={reset}
                shouldRedirectAfterSave={true}
            />

            <FormProvider {...methods}>
                <div className={css.salesSettingsContent}>
                    <div className={css.settings}>
                        <section className={css.card}>
                            <div className={css.titleContainer}>
                                <label
                                    htmlFor="salesPersuasionLevel"
                                    className={css.title}
                                >
                                    Set persuasion level
                                </label>
                                <IconTooltip>
                                    AI Agent will take into account your custom
                                    persuasion level in the way in interacts
                                    with customers.
                                </IconTooltip>
                            </div>
                            <div>
                                <OnboardingSteppedSlider
                                    steps={PersuasionLevelSteps}
                                    stepKey={salesPersuasionLevel}
                                    onChange={(value: string) => {
                                        handleSliderChange(
                                            'salesPersuasionLevel',
                                            value as PersuasionLevel,
                                        )
                                    }}
                                />
                                <AIBanner
                                    fillStyle="fill"
                                    className={css.description}
                                >
                                    {
                                        PersuasionLevelLabels[
                                            salesPersuasionLevel
                                        ]?.description
                                    }
                                </AIBanner>
                            </div>
                        </section>

                        <section className={css.card}>
                            <div className={css.titleContainer}>
                                <label
                                    htmlFor="salesDiscountStrategyLevel"
                                    className={css.title}
                                >
                                    Set your discount strategy
                                </label>
                                <IconTooltip>
                                    Define how often AI Agent should use
                                    discounts to encourage customers to complete
                                    a purchase.
                                </IconTooltip>
                            </div>
                            <div>
                                <OnboardingSteppedSlider
                                    steps={DiscountStrategySteps}
                                    stepKey={salesDiscountStrategyLevel}
                                    onChange={(value: string) => {
                                        handleSliderChange(
                                            'salesDiscountStrategyLevel',
                                            value as DiscountStrategy,
                                        )
                                    }}
                                />

                                <AIBanner
                                    fillStyle="fill"
                                    className={css.description}
                                >
                                    {
                                        DiscountStrategyLabels[
                                            salesDiscountStrategyLevel
                                        ]?.description
                                    }
                                </AIBanner>
                            </div>

                            <hr />

                            <div className={css.maxDiscountContainer}>
                                <Label htmlFor="percentage-discount">
                                    Maximum discount percentage
                                    <IconTooltip>
                                        Set the maximum discount that AI Agent
                                        will offer customers
                                    </IconTooltip>
                                </Label>

                                <InputField
                                    id="percentage-discount"
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={salesDiscountMax}
                                    data-testid="discount-max"
                                    onChange={onChangeDiscountMax}
                                    suffix={<IconInput icon="percent" />}
                                    error={errors.salesDiscountMax?.message}
                                    isDisabled={
                                        salesDiscountStrategyLevel ===
                                        DiscountStrategy.NoDiscount
                                    }
                                    className={css.maxDiscountInput}
                                />
                            </div>
                        </section>

                        <div className={css.contentActions}>
                            <Button
                                onClick={handleSubmit(onSave)}
                                isDisabled={!hasChanges}
                                type="submit"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </FormProvider>
        </>
    )
}
