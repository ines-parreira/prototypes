import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router'

import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { assetsUrl } from 'utils'
import { getLDClient } from 'utils/launchDarkly'

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

const ESTIMATED_INFLUENCED_GMV = 0.6

type Props = {
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
}

export const TriggerOnSearchSettings = ({ gmv, isGmvLoading }: Props) => {
    const { watch, setValue } = useFormContext()
    const isSalesHelpOnSearchEnabled = watch('isSalesHelpOnSearchEnabled')

    const { shopName } = useParams<{ shopName: string }>()

    const flags = getLDClient().allFlags()
    const routes = getAiAgentNavigationRoutes(shopName, flags)

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()

    const potentialImpact = usePotentialImpact(ESTIMATED_INFLUENCED_GMV, gmv)

    return (
        <EngagementSettingsCard>
            <EngagementSettingsCardContentWrapper>
                <EngagementSettingsCardImage
                    alt="image showing an example of the trigger on search"
                    src={assetsUrl(
                        '/img/ai-agent/ai_agent_trigger_on_search.png',
                    )}
                />

                <EngagementSettingsCardContent>
                    <EngagementSettingsCardTitle>
                        Trigger on search
                    </EngagementSettingsCardTitle>

                    <EngagementSettingsCardDescription>
                        Send a personalized message right after a shopper
                        searches to guide them to the right product and drive
                        more conversions.
                    </EngagementSettingsCardDescription>

                    {storeConfiguration?.isSalesHelpOnSearchEnabled ? (
                        <EngagementSettingsCardLinkButton
                            href={routes.analytics}
                            icon="insights"
                            text="Track Performance"
                        />
                    ) : (
                        <EngagementSettingsCardImpact
                            icon="lock"
                            impact={potentialImpact}
                            isLoading={isGmvLoading}
                        />
                    )}
                </EngagementSettingsCardContent>

                <EngagementSettingsCardToggle
                    isChecked={isSalesHelpOnSearchEnabled}
                    onChange={() =>
                        setValue(
                            'isSalesHelpOnSearchEnabled',
                            !isSalesHelpOnSearchEnabled,
                            {
                                shouldDirty: true,
                            },
                        )
                    }
                />
            </EngagementSettingsCardContentWrapper>
        </EngagementSettingsCard>
    )
}
