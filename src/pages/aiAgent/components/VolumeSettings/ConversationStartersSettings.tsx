import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router'

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

export const ConversationStartersSettings = ({
    isEnabled,
}: {
    isEnabled: boolean
}) => {
    const { watch, setValue } = useFormContext()
    const isConversationStartersEnabled = watch('isConversationStartersEnabled')

    const { shopName } = useParams<{ shopName: string }>()

    const flags = getLDClient().allFlags()
    const routes = getAiAgentNavigationRoutes(shopName, flags)

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()

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
                    <EngagementSettingsCardTitle>
                        Suggested Product Questions
                    </EngagementSettingsCardTitle>

                    <EngagementSettingsCardDescription>
                        Show up to 3 dynamic, AI-generated questions on product
                        pages, based on what shoppers are most likely to ask, to
                        resolve doubts quickly and drive more conversions.
                    </EngagementSettingsCardDescription>

                    {storeConfiguration?.isConversationStartersEnabled ? (
                        <EngagementSettingsCardLinkButton
                            href={routes.analytics}
                            icon="insights"
                            text="Track Performance"
                        />
                    ) : (
                        <EngagementSettingsCardImpact
                            icon="lock"
                            impact="Unlock up to ~5% additional GMV"
                        />
                    )}
                </EngagementSettingsCardContent>

                <EngagementSettingsCardToggle
                    isDisabled={!isEnabled}
                    isChecked={isConversationStartersEnabled}
                    onChange={() =>
                        setValue(
                            'isConversationStartersEnabled',
                            !isConversationStartersEnabled,
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
