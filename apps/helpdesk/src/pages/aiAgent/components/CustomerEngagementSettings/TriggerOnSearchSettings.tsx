import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router'

import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
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

import css from './TriggerOnSearchSettings.less'

export const TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV = 0.04

type Props = {
    description?: string
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
}

export const TriggerOnSearchSettings = ({
    description = 'Send a personalized message right after a shopper searches to guide them to the right product and drive more conversions.',
    gmv,
    isGmvLoading,
}: Props) => {
    const { watch, setValue } = useFormContext()
    const isSalesHelpOnSearchEnabled = watch('isSalesHelpOnSearchEnabled')
    const { shopName } = useParams<{ shopName: string }>()

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const potentialImpact = usePotentialImpact(
        TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV,
        gmv,
    )

    const handleToggle = () =>
        setValue('isSalesHelpOnSearchEnabled', !isSalesHelpOnSearchEnabled, {
            shouldDirty: true,
        })

    return (
        <EngagementSettingsCard>
            <EngagementSettingsCardContentWrapper>
                <EngagementSettingsCardImage
                    alt="image showing an example of the trigger on search"
                    src={assetsUrl(
                        '/img/ai-agent/ai_agent_trigger_on_search_small.png',
                    )}
                />

                <EngagementSettingsCardContent className={css.cardContent}>
                    <div className={css.cardHeader}>
                        <EngagementSettingsCardTitle>
                            Trigger on search
                        </EngagementSettingsCardTitle>
                        {!storeConfiguration?.isSalesHelpOnSearchEnabled && (
                            <EngagementSettingsCardImpact
                                icon="lock"
                                impact={potentialImpact}
                                isLoading={isGmvLoading}
                                isChecked
                            />
                        )}

                        <EngagementSettingsCardToggle
                            isChecked={isSalesHelpOnSearchEnabled}
                            onChange={handleToggle}
                        />
                    </div>

                    <EngagementSettingsCardDescription>
                        {description}
                    </EngagementSettingsCardDescription>

                    {storeConfiguration?.isSalesHelpOnSearchEnabled && (
                        <EngagementSettingsCardLinkButton
                            href={`/app/stats/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}/${shopName}`}
                            text="Track Performance"
                        />
                    )}
                </EngagementSettingsCardContent>
            </EngagementSettingsCardContentWrapper>
        </EngagementSettingsCard>
    )
}
