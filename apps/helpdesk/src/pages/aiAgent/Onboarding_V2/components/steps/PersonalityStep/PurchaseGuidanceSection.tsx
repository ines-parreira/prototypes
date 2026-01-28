import { logEvent, SegmentEvent } from '@repo/logging'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
    Box,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import type { SalesSettingsData } from 'models/aiAgent/types'
import Card from 'pages/aiAgent/Onboarding_V2/components/Card/Card'
import { OnboardingSteppedSlider } from 'pages/aiAgent/Onboarding_V2/components/OnboardingSteppedSlider/OnboardingSteppedSlider'
import css from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersonalityStep.less'
import type { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import {
    PersuasionLevelLabels,
    PersuasionLevelSteps,
} from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'

export const PurchaseGuidanceSection = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const { watch, setValue } = useFormContext<SalesSettingsData>()

    const salesPersuasionLevel = watch('salesPersuasionLevel')
    const salesDiscountStrategyLevel = watch('salesDiscountStrategyLevel')

    const handleChange = (value: PersuasionLevel) => {
        setValue('salesPersuasionLevel', value, {
            shouldValidate: true,
            shouldDirty: true,
        })

        logEvent(SegmentEvent.AiAgentNewOnboardingWizardSalesGaugesUsed, {
            persuasion: value,
            discount: salesDiscountStrategyLevel,
            shopName,
        })
    }

    return (
        <Card className={css.cardSection}>
            <Box alignItems="center" gap="xxs">
                <Text variant="bold">Purchase guidance</Text>
                <Tooltip delay={0}>
                    <TooltipTrigger>
                        <Icon name="info" size="sm" />
                    </TooltipTrigger>
                    <TooltipContent title="AI Agent will take into account your custom persuasion level in the way in interacts with customers." />
                </Tooltip>
            </Box>
            <OnboardingSteppedSlider
                steps={PersuasionLevelSteps}
                stepKey={salesPersuasionLevel}
                onChange={(newValue: string) => {
                    handleChange(newValue as PersuasionLevel)
                }}
            />
            <Box padding="md" className={css.banner}>
                {PersuasionLevelLabels[salesPersuasionLevel]?.description}
            </Box>
        </Card>
    )
}
