import { logEvent, SegmentEvent } from '@repo/logging'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
    Box,
    Icon,
    Label,
    Separator,
    Text,
    TextField,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import type { SalesSettingsData } from 'models/aiAgent/types'
import Card from 'pages/aiAgent/Onboarding_V2/components/Card/Card'
import { OnboardingSteppedSlider } from 'pages/aiAgent/Onboarding_V2/components/OnboardingSteppedSlider/OnboardingSteppedSlider'
import {
    DiscountStrategy,
    DiscountStrategyLabels,
    DiscountStrategySteps,
} from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import css from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersonalityStep.less'

export const DiscountStrategySection = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const {
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useFormContext<SalesSettingsData>()

    const salesPersuasionLevel = watch('salesPersuasionLevel')
    const salesDiscountStrategyLevel = watch('salesDiscountStrategyLevel')
    const salesDiscountMax = watch('salesDiscountMax')

    const handleStrategyChange = (value: DiscountStrategy) => {
        setValue('salesDiscountStrategyLevel', value, {
            shouldValidate: true,
            shouldDirty: true,
        })

        if (value === DiscountStrategy.NoDiscount) {
            setValue('salesDiscountMax', 0, {
                shouldValidate: true,
                shouldDirty: true,
            })
        }

        if (value !== DiscountStrategy.NoDiscount && !salesDiscountMax) {
            setValue('salesDiscountMax', 8, {
                shouldValidate: true,
                shouldDirty: true,
            })
        }

        void trigger('salesDiscountMax')

        logEvent(SegmentEvent.AiAgentNewOnboardingWizardSalesGaugesUsed, {
            persuasion: salesPersuasionLevel,
            discount: value,
            shopName,
        })
    }

    const handleMaxChange = (value: string) => {
        if (value === '') {
            setValue('salesDiscountMax', value as any, {
                shouldValidate: false,
                shouldDirty: true,
            })
            return
        }

        const parsedValue = Number(value)
        const safeValue = !value || isNaN(parsedValue) ? 0 : parsedValue

        setValue('salesDiscountMax', safeValue, {
            shouldValidate: true,
            shouldDirty: true,
        })

        logEvent(SegmentEvent.AiAgentNewOnboardingWizardDiscountChanged, {
            value: safeValue,
            shopName,
        })

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

    return (
        <Card className={css.cardSection}>
            <Box alignItems="center" gap="xxs">
                <Text variant="bold">Discount strategy</Text>
                <Tooltip delay={0}>
                    <TooltipTrigger>
                        <Icon name="info" size="sm" />
                    </TooltipTrigger>
                    <TooltipContent title="Define how often AI Agent should use discounts to encourage customers to complete a purchase." />
                </Tooltip>
            </Box>
            <OnboardingSteppedSlider
                steps={DiscountStrategySteps}
                stepKey={salesDiscountStrategyLevel}
                onChange={(newValue: string) => {
                    handleStrategyChange(newValue as DiscountStrategy)
                }}
            />
            <Box padding="md" className={css.banner}>
                <Text size="sm">
                    {
                        DiscountStrategyLabels[salesDiscountStrategyLevel]
                            .description
                    }
                </Text>
            </Box>
            <Box marginTop="md" marginBottom="md">
                <Separator />
            </Box>
            <Box justifyContent="space-between">
                <Box display="flex" gap="xxs" alignItems="flex-start">
                    <Label htmlFor="percentage-discount">
                        Fixed discount (%)
                    </Label>
                    <Tooltip delay={0}>
                        <TooltipTrigger>
                            <Icon name="info" size="sm" />
                        </TooltipTrigger>
                        <TooltipContent title="Choose the discount amount Shopping Assistant offers." />
                    </Tooltip>
                </Box>
                <div className={css.percentageInput}>
                    <TextField
                        data-testid="percentage-input"
                        type="text"
                        id="percentage-discount"
                        value={String(salesDiscountMax)}
                        onChange={handleMaxChange}
                        error={errors.salesDiscountMax?.message}
                        isDisabled={
                            salesDiscountStrategyLevel ===
                            DiscountStrategy.NoDiscount
                        }
                        trailingSlot="%"
                    />
                </div>
            </Box>
        </Card>
    )
}
