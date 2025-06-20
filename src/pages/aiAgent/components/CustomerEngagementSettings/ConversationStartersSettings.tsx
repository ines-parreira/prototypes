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

import css from './ConversationStartersSettings.less'

export const CONV_STARTERS_ESTIMATED_INFLUENCED_GMV = 0.17

type Props = {
    description?: string
    isEnabled: boolean
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
    isOnboarding?: boolean
}

export const ConversationStartersSettings = ({
    description = 'Show up to 3 dynamic, AI-generated questions on product pages, based on what shoppers are most likely to ask—automatically generated from your product content—to resolve doubts quickly and drive more conversions.',
    isEnabled,
    gmv,
    isGmvLoading,
    isOnboarding = false,
}: Props) => {
    const { watch, setValue } = useFormContext()
    const isConversationStartersEnabled = watch('isConversationStartersEnabled')
    const { shopName } = useParams<{ shopName: string }>()

    const flags = getLDClient().allFlags()
    const routes = getAiAgentNavigationRoutes(shopName, flags)

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

    const renderLinkOrImpact = (hideImpact?: boolean) => {
        if (hideImpact) {
            return null
        }

        if (isOnboarding) {
            return (
                <EngagementSettingsCardImpact
                    icon="lock"
                    impact={potentialImpact}
                    isLoading={isGmvLoading}
                    isChecked={isConversationStartersEnabled}
                />
            )
        }

        if (storeConfiguration?.isConversationStartersEnabled) {
            return (
                <EngagementSettingsCardLinkButton
                    href={routes.analytics}
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
                    alt="image showing an example of the conversation starters"
                    src={assetsUrl(
                        '/img/ai-agent/ai_agent_conversation_starters.png',
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
                            Suggested product questions
                        </EngagementSettingsCardTitle>

                        {isOnboarding && (
                            <EngagementSettingsCardToggle
                                isChecked={isConversationStartersEnabled}
                                isDisabled={!isEnabled}
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
                        isChecked={isConversationStartersEnabled}
                        isDisabled={!isEnabled}
                        onChange={handleToggle}
                    />
                )}
            </EngagementSettingsCardContentWrapper>
        </EngagementSettingsCard>
    )
}
