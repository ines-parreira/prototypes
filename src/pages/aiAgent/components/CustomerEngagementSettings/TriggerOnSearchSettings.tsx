import classNames from 'classnames'
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

import css from './TriggerOnSearchSettings.less'

export const TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV = 0.06

type Props = {
    description?: string
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
    isOnboarding?: boolean
}

export const TriggerOnSearchSettings = ({
    description = 'Send a personalized message right after a shopper searches to guide them to the right product and drive more conversions.',
    gmv,
    isGmvLoading,
    isOnboarding = false,
}: Props) => {
    const { watch, setValue } = useFormContext()
    const isSalesHelpOnSearchEnabled = watch('isSalesHelpOnSearchEnabled')
    const { shopName } = useParams<{ shopName: string }>()

    const flags = getLDClient().allFlags()
    const routes = getAiAgentNavigationRoutes(shopName, flags)

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const potentialImpact = usePotentialImpact(
        TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV,
        gmv,
    )

    const handleToggle = () =>
        setValue('isSalesHelpOnSearchEnabled', !isSalesHelpOnSearchEnabled, {
            shouldDirty: true,
        })

    const renderLinkOrImpact = (hideImpact?: boolean) => {
        if (hideImpact) return null

        if (isOnboarding) {
            return (
                <EngagementSettingsCardImpact
                    icon="lock"
                    impact={potentialImpact}
                    isLoading={isGmvLoading}
                    isChecked={isSalesHelpOnSearchEnabled}
                />
            )
        }

        if (storeConfiguration?.isSalesHelpOnSearchEnabled) {
            return (
                <EngagementSettingsCardLinkButton
                    href={routes.analytics}
                    icon="insights"
                    text="Track Performance"
                />
            )
        }

        return (
            <EngagementSettingsCardImpact
                icon="lock"
                impact={potentialImpact}
                isLoading={isGmvLoading}
                isChecked
            />
        )
    }

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
                    <div
                        className={classNames(
                            css.cardHeader,
                            isOnboarding
                                ? css['cardHeader--spaceBetween']
                                : css['cardHeader--flexStart'],
                        )}
                    >
                        <EngagementSettingsCardTitle>
                            Trigger on search
                        </EngagementSettingsCardTitle>

                        {isOnboarding && (
                            <EngagementSettingsCardToggle
                                isChecked={isSalesHelpOnSearchEnabled}
                                onChange={handleToggle}
                            />
                        )}
                    </div>
                    {renderLinkOrImpact(!isOnboarding)}
                    <EngagementSettingsCardDescription>
                        {description}
                    </EngagementSettingsCardDescription>
                    {renderLinkOrImpact(isOnboarding)}
                </EngagementSettingsCardContent>

                {!isOnboarding && (
                    <EngagementSettingsCardToggle
                        isChecked={isSalesHelpOnSearchEnabled}
                        onChange={handleToggle}
                    />
                )}
            </EngagementSettingsCardContentWrapper>
        </EngagementSettingsCard>
    )
}
