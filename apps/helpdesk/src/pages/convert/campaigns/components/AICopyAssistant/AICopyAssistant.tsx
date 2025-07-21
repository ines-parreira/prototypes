import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { useSuggestCampaignCopy } from 'models/convert/campaign/queries'
import { CampaignSuggestCopyResponse } from 'models/convert/campaign/types'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import Button from 'pages/common/components/button/Button'
import { VerticalTextCarousel } from 'pages/common/components/VerticalTextCarousel/VerticalTextCarousel'
import { DEFAULT_CAMPAIGN_NAME } from 'pages/convert/campaigns/constants/labels'
import { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { CampaignTrigger } from 'pages/convert/campaigns/types/CampaignTrigger'
import { getCurrentAccountId } from 'state/currentAccount/selectors'

import css from './AICopyAssistant.less'

const SUCCESS_MESSAGE =
    'Great, your campaign message is enhanced! You can always edit it above.'

type Props = {
    campaign: Campaign
    triggers: CampaignTrigger[]
    shopDomain: string
    shopId: number
    isEnabled: boolean
    shouldGenerateInitialSuggestion: boolean
    onApply: (suggestion: string) => void
}

export const AICopyAssistant = ({
    campaign,
    triggers,
    shopDomain,
    shopId,
    isEnabled = false,
    shouldGenerateInitialSuggestion = false,
    onApply,
}: Props) => {
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [hasError, setHasError] = useState(false)
    const hasGeneratedInitialSuggestion = useRef(false)
    const currentAccountId = useAppSelector(getCurrentAccountId)

    const { mutateAsync: generateSuggestions } = useSuggestCampaignCopy()

    const context = useMemo(() => {
        const title =
            campaign.name.toLowerCase() === DEFAULT_CAMPAIGN_NAME.toLowerCase()
                ? ''
                : campaign.name

        return {
            store_domain: shopDomain,
            title: title,
            language: campaign.language || undefined,
            message: campaign.message_text,
            triggers: triggers,
        }
    }, [
        campaign.language,
        campaign.message_text,
        campaign.name,
        shopDomain,
        triggers,
    ])

    const onGenerateClick = useCallback(async () => {
        setIsRegenerating(true)
        setHasError(false)
        try {
            const response = await generateSuggestions([undefined, context])
            const data = response?.data as CampaignSuggestCopyResponse
            setSuggestions(data.suggestions.length ? data.suggestions : [])
        } catch (e) {
            setHasError(true)
            console.error(e)
        } finally {
            setIsRegenerating(false)
        }
    }, [context, generateSuggestions])

    useEffect(() => {
        if (
            isEnabled &&
            shouldGenerateInitialSuggestion &&
            !hasGeneratedInitialSuggestion.current
        ) {
            void onGenerateClick()
            hasGeneratedInitialSuggestion.current = true
        }
    }, [isEnabled, shouldGenerateInitialSuggestion, onGenerateClick])

    const applyButton = (
        <Button size="small" intent="primary" fillStyle="ghost">
            Apply
        </Button>
    )

    const onApplyClick = useCallback(
        (suggestion: string) => {
            onApply(suggestion)
            logEvent(SegmentEvent.ConvertApplySuggestionClicked, {
                accountId: currentAccountId,
                shopId: shopId,
                campaignId: campaign.id,
                context: context,
                suggestion: suggestion,
            })
        },
        [onApply, context, currentAccountId, shopId, campaign.id],
    )

    const generateButtonLabel = useMemo(() => {
        if (isRegenerating) {
            return suggestions.length ? 'Regenerating' : 'Generating'
        }

        return shouldGenerateInitialSuggestion || suggestions.length
            ? 'Regenerate'
            : 'Generate'
    }, [isRegenerating, shouldGenerateInitialSuggestion, suggestions])

    return (
        <AIBanner className={css.banner} hasError={hasError}>
            <div className={css.wrapper}>
                <div className={css.headerRow}>
                    <div className={css.intro}>
                        <span className={css.title}>
                            Uplift your message with AI Copy Assistant
                        </span>
                    </div>
                    <div>
                        <Button
                            size="small"
                            intent="secondary"
                            isLoading={isRegenerating}
                            className={css.regenerateButton}
                            onClick={onGenerateClick}
                        >
                            {generateButtonLabel}
                        </Button>
                    </div>
                </div>
                <div>
                    <VerticalTextCarousel
                        texts={suggestions}
                        cta={applyButton}
                        ctaSuccessMessage={SUCCESS_MESSAGE}
                        onCtaClick={onApplyClick}
                    />
                </div>
            </div>
        </AIBanner>
    )
}
