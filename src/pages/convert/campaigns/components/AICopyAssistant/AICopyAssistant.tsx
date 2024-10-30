import React, {useCallback, useEffect, useRef, useState} from 'react'

import {useSuggestCampaignCopy} from 'models/convert/campaign/queries'
import {CampaignSuggestCopyResponse} from 'models/convert/campaign/types'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import Button from 'pages/common/components/button/Button'
import {VerticalTextCarousel} from 'pages/common/components/VerticalTextCarousel/VerticalTextCarousel'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import {DEFAULT_CAMPAIGN_NAME} from 'pages/convert/campaigns/constants/labels'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {CampaignTrigger} from 'pages/convert/campaigns/types/CampaignTrigger'
import {useIsAICopyAssistantEnabled} from 'pages/convert/common/hooks/useIsAICopyAssistantEnabled'

import css from './AICopyAssistant.less'

const SUCCESS_MESSAGE =
    'Great, your campaign message is enhanced! You can always edit it above.'

type Props = {
    campaign: Campaign
    triggers: CampaignTrigger[]
    shopDomain: string
    isEnabled: boolean
    shouldGenerateInitialSuggestion: boolean
    onApply: (suggestion: string) => void
}

export const AICopyAssistant = ({
    campaign,
    triggers,
    shopDomain,
    isEnabled = false,
    shouldGenerateInitialSuggestion = false,
    onApply,
}: Props) => {
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [hasError, setHasError] = useState(false)
    const hasGeneratedInitialSuggestion = useRef(false)

    const {mutateAsync: generateSuggestions} = useSuggestCampaignCopy()
    const isAssistantEnabled = useIsAICopyAssistantEnabled()

    const onRegenerateClick = useCallback(async () => {
        setIsRegenerating(true)
        setHasError(false)

        const title =
            campaign.name.toLowerCase() === DEFAULT_CAMPAIGN_NAME.toLowerCase()
                ? ''
                : campaign.name
        try {
            const response = await generateSuggestions([
                undefined,
                {
                    store_domain: shopDomain,
                    title: title,
                    language: campaign.language || undefined,
                    message: campaign.message_text,
                    triggers: triggers,
                },
            ])
            const data = response?.data as CampaignSuggestCopyResponse
            setSuggestions(data.suggestions.length ? data.suggestions : [])
        } catch (e) {
            setHasError(true)
            console.error(e)
        } finally {
            setIsRegenerating(false)
        }
    }, [
        campaign.language,
        campaign.message_text,
        campaign.name,
        generateSuggestions,
        shopDomain,
        triggers,
    ])

    useEffect(() => {
        if (
            isAssistantEnabled &&
            isEnabled &&
            shouldGenerateInitialSuggestion &&
            !hasGeneratedInitialSuggestion.current
        ) {
            void onRegenerateClick()
            hasGeneratedInitialSuggestion.current = true
        }
    }, [
        isAssistantEnabled,
        isEnabled,
        shouldGenerateInitialSuggestion,
        onRegenerateClick,
    ])

    const applyButton = (
        <Button size="small" intent="primary" fillStyle="ghost">
            Apply
        </Button>
    )

    if (!isAssistantEnabled) {
        return null
    }

    return (
        <AIBanner className={css.banner} hasError={hasError}>
            <div className={css.wrapper}>
                <div className={css.headerRow}>
                    <div className={css.intro}>
                        <span className={css.title}>
                            Uplift your message with AI Copy Assistant
                        </span>
                        <IconTooltip
                            icon="info"
                            tooltipProps={{
                                placement: 'top',
                            }}
                            className={css.tooltip}
                        >
                            Type your campaign message below and AI Copy
                            Assistant will uplift it. Highlight key values and
                            add a call-to-action with relevant URLs or discount
                            codes.
                        </IconTooltip>
                    </div>
                    <div>
                        <Button
                            size="small"
                            intent="secondary"
                            isLoading={isRegenerating}
                            className={css.regenerateButton}
                            onClick={onRegenerateClick}
                        >
                            {isRegenerating ? 'Regenerating' : 'Regenerate'}
                        </Button>
                    </div>
                </div>
                <div>
                    <VerticalTextCarousel
                        texts={suggestions}
                        cta={applyButton}
                        ctaSuccessMessage={SUCCESS_MESSAGE}
                        onCtaClick={onApply}
                    />
                </div>
            </div>
        </AIBanner>
    )
}
