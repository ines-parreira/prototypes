import type { ComponentProps } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'
import { ChatSettingsLanguagesSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationLanguages/ChatSettingsLanguagesSkeleton'
import { GorgiasChatIntegrationLanguagesRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationLanguages'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import GorgiasChatIntegrationLanguagesLegacy from './legacy/GorgiasChatIntegrationLanguages/GorgiasChatIntegrationLanguages'

type Props = ComponentProps<typeof GorgiasChatIntegrationLanguagesLegacy>

export const GorgiasChatIntegrationLanguages = (props: Props) => {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const {
        shouldShowRevampWhenAiAgentEnabled,
        isLoading: isStoreConfigLoading,
    } = useShouldShowChatSettingsRevamp(
        storeIntegration,
        props.integration.get('id'),
    )

    const {
        value: isChatSettingsRevampEnabled,
        isLoading: isChatSettingsRevampLoading,
    } = useFlagWithLoading(FeatureFlagKey.ChatSettingsRevamp)

    const {
        value: isChatSettingsScreensRevampEnabled,
        isLoading: isChatSettingsScreensRevampLoading,
    } = useFlagWithLoading(FeatureFlagKey.ChatSettingsScreensRevamp)

    if (
        isChatSettingsRevampLoading ||
        isChatSettingsScreensRevampLoading ||
        isStoreConfigLoading
    ) {
        return <ChatSettingsLanguagesSkeleton />
    }

    if (
        isChatSettingsRevampEnabled &&
        isChatSettingsScreensRevampEnabled &&
        shouldShowRevampWhenAiAgentEnabled
    ) {
        return <GorgiasChatIntegrationLanguagesRevamp {...props} />
    }

    return <GorgiasChatIntegrationLanguagesLegacy {...props} />
}
