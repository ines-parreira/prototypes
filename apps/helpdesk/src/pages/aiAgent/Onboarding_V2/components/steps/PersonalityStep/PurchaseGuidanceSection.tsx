import { useFormContext } from 'react-hook-form'

import { Box, Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

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
    const { watch, setValue } = useFormContext<SalesSettingsData>()

    const salesPersuasionLevel = watch('salesPersuasionLevel')

    const handleChange = (value: PersuasionLevel) => {
        setValue('salesPersuasionLevel', value, {
            shouldValidate: true,
            shouldDirty: true,
        })
    }

    return (
        <Card className={css.cardSection}>
            <Box alignItems="center" gap="xxs">
                <Text variant="bold">Purchase guidance</Text>
                <Tooltip delay={0} trigger={<Icon name="info" size="sm" />}>
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
                <Text size="sm">
                    {PersuasionLevelLabels[salesPersuasionLevel].description}
                </Text>
            </Box>
        </Card>
    )
}
