import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { STATS_ROUTES } from 'routes/constants'
import { assetsUrl } from 'utils'

import {
    EngagementSettingsCard,
    EngagementSettingsCardContent,
    EngagementSettingsCardContentWrapper,
    EngagementSettingsCardDescription,
    EngagementSettingsCardImage,
    EngagementSettingsCardTitle,
} from './card/EngagementSettingsCard'
import { EngagementSettingsCardImpact } from './card/EngagementSettingsCardImpact'
import { EngagementSettingsCardLinkButton } from './card/EngagementSettingsCardLinkButton'
import { EngagementSettingsCardToggle } from './card/EngagementSettingsCardToggle'
import { usePotentialImpact } from './hooks/usePotentialImpact'

import css from './ConversationStartersSettings.less'

export const CONV_STARTERS_ESTIMATED_INFLUENCED_GMV = 0.17

type Props = {
    description?: string
    isEnabled: boolean
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
}

export const ConversationStartersSettings = ({
    description = 'Show up to 3 dynamic, AI-generated questions on product pages, based on what shoppers are most likely to ask—automatically generated from your product content—to resolve doubts quickly and drive more conversions.',
    isEnabled,
    gmv,
    isGmvLoading,
}: Props) => {
    const isActionDrivenAiAgentNavigationEnabled = useFlag(
        FeatureFlagKey.ActionDrivenAiAgentNavigation,
    )
    const { watch, setValue } = useFormContext()
    const isConversationStartersEnabled = watch('isConversationStartersEnabled')
    const { shopName } = useParams<{ shopName: string }>()

    const { routes } = useAiAgentNavigation({ shopName })

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const potentialImpact = usePotentialImpact(
        CONV_STARTERS_ESTIMATED_INFLUENCED_GMV,
        gmv,
    )

    const handleToggle = () =>
        setValue(
            'isConversationStartersEnabled',
            !isConversationStartersEnabled,
            {
                shouldDirty: true,
            },
        )

    return (
        <EngagementSettingsCard>
            <EngagementSettingsCardContentWrapper>
                <EngagementSettingsCardImage
                    alt="image showing an example of the conversation starters"
                    src={assetsUrl(
                        '/img/ai-agent/ai_agent_conversation_starters_small.png',
                    )}
                />

                <EngagementSettingsCardContent className={css.cardContent}>
                    <div className={css.cardHeader}>
                        <EngagementSettingsCardTitle>
                            Suggested product questions
                        </EngagementSettingsCardTitle>
                        {!storeConfiguration?.isConversationStartersEnabled && (
                            <EngagementSettingsCardImpact
                                icon="lock"
                                impact={potentialImpact}
                                isLoading={isGmvLoading}
                                isChecked
                            />
                        )}

                        <EngagementSettingsCardToggle
                            isChecked={isConversationStartersEnabled}
                            isDisabled={!isEnabled}
                            onChange={handleToggle}
                        />
                    </div>

                    <EngagementSettingsCardDescription>
                        {description}
                    </EngagementSettingsCardDescription>

                    {storeConfiguration?.isConversationStartersEnabled && (
                        <EngagementSettingsCardLinkButton
                            href={
                                isActionDrivenAiAgentNavigationEnabled
                                    ? `/app/stats/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}`
                                    : routes.analytics
                            }
                            text="Track Performance"
                        />
                    )}
                </EngagementSettingsCardContent>
            </EngagementSettingsCardContentWrapper>
        </EngagementSettingsCard>
    )
}
