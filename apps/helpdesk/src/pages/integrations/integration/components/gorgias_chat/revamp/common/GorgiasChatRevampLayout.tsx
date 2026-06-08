import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import type { Map } from 'immutable'

import { toast } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/types'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { ChatRedesignOptInBanner } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatRedesignOptInBanner/ChatRedesignOptInBanner'
import { ChatRedesignSwitchConfirmModal } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatRedesignSwitchConfirmModal/ChatRedesignSwitchConfirmModal'
import { ChatSettingsPageHeader } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatSettingsPageHeader/ChatSettingsPageHeader'
import { useChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignOptIn'
import { useLogMigrationEvent } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useLogMigrationEvent'
import { useSetChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useSetChatRedesignOptIn'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasChatRevampNavigation } from './GorgiasChatRevampNavigation'

type Props = {
    integration: Map<any, any>
    onSave?: () => void
    isSaveDisabled?: boolean
    isSaving?: boolean
    isDirty?: boolean
    onSaveChanges?: () => Promise<unknown> | void
    onDiscardChanges?: () => void
    children: ReactNode
}

export const GorgiasChatRevampLayout = ({
    integration,
    onSave,
    isSaveDisabled,
    isSaving,
    isDirty,
    onSaveChanges,
    onDiscardChanges,
    children,
}: Props) => {
    const chatIntegrationsLink = `/app/settings/channels/${IntegrationType.GorgiasChat}`

    const chatId = integration.get('id') as number | undefined
    const { storeIntegration } = useStoreIntegration(integration)
    const { shouldShowNonAiAgentChatSettingsRevamp } =
        useShouldShowChatSettingsRevamp(storeIntegration, chatId)
    const { isOptedIn, optInDatetime } = useChatRedesignOptIn(chatId)
    const { isPreviewingNewChat } = useChatPreviewPanelContext()
    const { setOptIn, isSubmitting: isSwitchingToOldChat } =
        useSetChatRedesignOptIn(integration)
    const { logOptOutClicked } = useLogMigrationEvent()

    const isPreviewing = !isOptedIn && isPreviewingNewChat
    // While previewing the new chat nothing is persisted, so the Save action is
    // hidden until the customer either switches or leaves the preview.
    const shouldHideSave =
        shouldShowNonAiAgentChatSettingsRevamp && isPreviewing
    const shouldShowSwitchToOldChat =
        shouldShowNonAiAgentChatSettingsRevamp && isOptedIn

    const [isSwitchBackModalOpen, setIsSwitchBackModalOpen] = useState(false)

    const openSwitchBackModal = useCallback(
        () => setIsSwitchBackModalOpen(true),
        [],
    )

    const confirmSwitchToOldChat = useCallback(async () => {
        try {
            await setOptIn(false)
            logOptOutClicked({
                timeSinceOptInSeconds: optInDatetime
                    ? Math.max(
                          0,
                          Math.round(
                              (Date.now() - new Date(optInDatetime).getTime()) /
                                  1000,
                          ),
                      )
                    : 0,
            })
            setIsSwitchBackModalOpen(false)
            toast.success("You're on the old chat")
        } catch {
            // Keep the modal open so the user can retry.
            toast.error(
                "Couldn't switch back to the old chat. Please try again.",
            )
        }
    }, [setOptIn, logOptOutClicked, optInDatetime])

    const breadcrumbItems = useMemo(
        () => [
            {
                link: chatIntegrationsLink,
                label: 'All chats',
                id: '1',
            },
            {
                label: integration.get('name') as string,
                id: '2',
            },
        ],
        [integration, chatIntegrationsLink],
    )

    return (
        <div className="full-width">
            <ChatSettingsPageHeader
                breadcrumbItems={breadcrumbItems}
                backButtonLink={chatIntegrationsLink}
                title="Settings"
                onSave={shouldHideSave ? undefined : onSave}
                isSaveDisabled={isSaveDisabled}
                isSaveLoading={isSaving}
                onSwitchToOldChat={
                    shouldShowSwitchToOldChat ? openSwitchBackModal : undefined
                }
                isSwitchingToOldChat={isSwitchingToOldChat}
            />
            <ChatRedesignOptInBanner
                integration={integration}
                isDirty={isDirty}
                onSaveChanges={onSaveChanges}
                onDiscardChanges={onDiscardChanges}
            />
            <GorgiasChatRevampNavigation integration={integration} />
            {children}
            <ChatRedesignSwitchConfirmModal
                isOpen={isSwitchBackModalOpen}
                isOptedIn
                isSubmitting={isSwitchingToOldChat}
                onConfirm={confirmSwitchToOldChat}
                onOpenChange={setIsSwitchBackModalOpen}
            />
        </div>
    )
}
