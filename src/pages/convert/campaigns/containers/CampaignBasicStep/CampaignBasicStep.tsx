import React, { useMemo } from 'react'

import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { Label } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    getGorgiasChatLanguageByCode,
    mapIntegrationLanguagesToLanguagePicker,
} from 'config/integrations/gorgias_chat'
import { Language as LanguageEnum } from 'constants/languages'
import { Language } from 'pages/common/components/LanguagePicker/LanguagePicker'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { useCampaignFormContext } from 'pages/convert/campaigns/hooks/useCampaignFormContext'

import { StatefulAccordion } from '../../components/StatefulAccordion'
import { useCampaignDetailsContext } from '../../hooks/useCampaignDetailsContext'
import { useStepState } from '../../hooks/useStepState'
import { CampaignStepsKeys } from '../../types/CampaignSteps'
import { useIntegrationContext } from '../IntegrationProvider'

type Props = {
    count?: number
    isPristine?: boolean
    isValid?: boolean
    isDisabled?: boolean
}

export const CampaignBasicStep = ({
    count,
    isPristine = true,
    isValid = false,
    isDisabled = false,
}: Props) => {
    const { isEditMode } = useCampaignFormContext()
    const { campaign, updateCampaign } = useCampaignDetailsContext()
    const { chatIntegration } = useIntegrationContext()

    const stateProps = useStepState({
        count,
        isPristine,
        isValid,
        isEditMode,
        isDisabled,
    })

    const handleUpdateName = (value: string) => updateCampaign('name', value)

    const handleUpdateLanguage = (value: any) =>
        updateCampaign('language', value)

    const chatMultiLanguagesEnabled =
        useFlags()[FeatureFlagKey.ChatMultiLanguages]

    const languageOptions = useMemo<Language[]>(() => {
        const mappedLanguages = mapIntegrationLanguagesToLanguagePicker(
            fromJS(chatIntegration),
        )
        const campaignLanguage = getGorgiasChatLanguageByCode(
            campaign.language as LanguageEnum,
        ) as Language

        const exists = mappedLanguages.some(
            (language) => language.value === campaign.language,
        )
        if (!exists) {
            mappedLanguages.push(campaignLanguage)
        }
        return mappedLanguages
    }, [chatIntegration, campaign.language])

    return (
        <StatefulAccordion
            {...stateProps}
            id={CampaignStepsKeys.Basics}
            title="Set up the basics"
        >
            <InputField
                isRequired
                label="Campaign name"
                aria-label="Campaign name"
                placeholder="My new campaign"
                value={campaign.name}
                onChange={handleUpdateName}
            />

            {chatMultiLanguagesEnabled && (
                <div className="mt-4">
                    <Label className="mb-2" isRequired>
                        Language
                    </Label>
                    <SelectField
                        value={campaign.language}
                        onChange={handleUpdateLanguage}
                        options={languageOptions}
                        fullWidth
                    />
                </div>
            )}
        </StatefulAccordion>
    )
}
