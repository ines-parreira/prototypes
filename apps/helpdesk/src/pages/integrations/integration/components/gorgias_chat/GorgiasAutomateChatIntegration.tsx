import type { ComponentProps } from 'react'

import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasAutomateChatIntegration as GorgiasAutomateChatIntegrationLegacy } from './legacy/GorgiasAutomateChatIntegration'
import { ChatSettingsAutomationSkeleton } from './revamp/EditWizard/Automation/ChatSettingsAutomationSkeleton'
import { GorgiasAutomateChatIntegrationRevamp } from './revamp/EditWizard/Automation/GorgiasAutomateChatIntegration'

type Props = ComponentProps<typeof GorgiasAutomateChatIntegrationLegacy>

export function GorgiasAutomateChatIntegration(props: Props) {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id') as number | undefined

    const { shouldShowChatSettingsRevamp, isLoading: isRevampLoading } =
        useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    if (isRevampLoading || !chatId) {
        return <ChatSettingsAutomationSkeleton />
    }

    if (shouldShowChatSettingsRevamp) {
        return <GorgiasAutomateChatIntegrationRevamp {...props} />
    }

    return <GorgiasAutomateChatIntegrationLegacy {...props} />
}
