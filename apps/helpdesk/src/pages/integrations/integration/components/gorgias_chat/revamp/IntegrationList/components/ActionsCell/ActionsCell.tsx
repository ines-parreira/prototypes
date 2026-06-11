import { useCallback, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { Map } from 'immutable'
import { Link, useHistory } from 'react-router-dom'

import { Text, toast } from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import {
    GorgiasChatCreationWizardStatus,
    IntegrationType,
} from 'models/integration/types'
import { ForwardIcon } from 'pages/integrations/common/components/ForwardIcon'
import { ChatRedesignSwitchConfirmModal } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatRedesignSwitchConfirmModal/ChatRedesignSwitchConfirmModal'
import { useChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignOptIn'
import { useLogMigrationEvent } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useLogMigrationEvent'
import { useSetChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useSetChatRedesignOptIn'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'
import { Tab } from 'pages/integrations/integration/types'
import { makeGetRedirectUri } from 'state/integrations/selectors'

import css from './ActionsCell.less'

type ActionsCellProps = {
    chat: Map<any, any>
    storeIntegration: Map<any, any>
}

export const ActionsCell = ({ chat, storeIntegration }: ActionsCellProps) => {
    const showUpdatePermissions = useFlag(
        FeatureFlagKey.ChatScopeUpdateChatList,
    )

    const history = useHistory()
    const getRedirectUri = useAppSelector(makeGetRedirectUri)

    const chatIntegrationId = chat.get('id') as number

    // The opt-in action is gated by the same rules as the opt-in banner: the
    // chat must be eligible for the non-AI-agent chat revamp and not yet opted in.
    const { storeIntegration: connectedStoreIntegration } =
        useStoreIntegration(chat)
    const { shouldShowNonAiAgentChatSettingsRevamp } =
        useShouldShowChatSettingsRevamp(
            connectedStoreIntegration,
            chatIntegrationId,
        )
    const { isOptedIn } = useChatRedesignOptIn(chatIntegrationId)
    const { setOptIn, isSubmitting } = useSetChatRedesignOptIn(chat)
    const { logOptInConfirmed } = useLogMigrationEvent(chatIntegrationId)

    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const appearanceLink = `/app/settings/channels/${IntegrationType.GorgiasChat}/${chatIntegrationId}/${Tab.Appearance}`

    const openConfirm = useCallback((ev: React.MouseEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
        setIsConfirmOpen(true)
    }, [])

    const handleConfirmSwitch = useCallback(async () => {
        try {
            // Opt in first so the Appearance tab renders the opted-in state
            // immediately on arrival.
            await setOptIn(true)
            logOptInConfirmed()
            setIsConfirmOpen(false)
            toast.success("You're on the updated chat")
            history.push(appearanceLink)
        } catch {
            // Keep the modal open so the user can retry.
            toast.error("Couldn't switch to the new chat. Please try again.")
        }
    }, [setOptIn, logOptInConfirmed, history, appearanceLink])

    const renderAction = useCallback(() => {
        const wizardStatus: GorgiasChatCreationWizardStatus = chat.getIn([
            'meta',
            'wizard',
            'status',
        ])

        const needScopeUpdate = Boolean(
            storeIntegration?.getIn(['meta', 'need_scope_update'], false),
        )

        const shopIntegrationId: number | null = chat.getIn(
            ['meta', 'shop_integration_id'],
            null,
        )
        const shopifyIntegrationIds: number[] = chat
            .getIn(['meta', 'shopify_integration_ids'], null)
            ?.toArray()

        const isOneClickInstallation = shopIntegrationId
            ? shopifyIntegrationIds?.includes(shopIntegrationId)
            : false

        const baseLink = `/app/settings/channels/${IntegrationType.GorgiasChat}/${chatIntegrationId}`
        const editLink = `${baseLink}/${
            wizardStatus === GorgiasChatCreationWizardStatus.Draft
                ? Tab.CreateWizard
                : Tab.Appearance
        }`

        const shopName = storeIntegration?.getIn(['meta', 'shop_name'])

        const redirectUri = getRedirectUri(IntegrationType.Shopify)

        const retriggerOAuthFlow = (ev: React.MouseEvent) => {
            ev.stopPropagation()
            window.location.href = redirectUri.replace('{shop_name}', shopName)
        }

        if (wizardStatus === GorgiasChatCreationWizardStatus.Draft) {
            return (
                <Text size="md" variant="medium" align="right">
                    <Link to={editLink} onClick={(e) => e.stopPropagation()}>
                        Finish setup
                    </Link>
                </Text>
            )
        }

        if (shouldShowNonAiAgentChatSettingsRevamp && !isOptedIn) {
            return (
                <Text size="md" variant="medium" align="right">
                    <Link to={appearanceLink} onClick={openConfirm}>
                        Update to new chat
                    </Link>
                </Text>
            )
        }

        if (
            showUpdatePermissions &&
            isOneClickInstallation &&
            needScopeUpdate
        ) {
            return (
                <Text size="md" variant="medium" align="right">
                    <a onClick={retriggerOAuthFlow} href="#">
                        Update permissions
                    </a>
                </Text>
            )
        }

        return (
            <ForwardIcon href={editLink} onClick={(e) => e.stopPropagation()} />
        )
    }, [
        chat,
        chatIntegrationId,
        storeIntegration,
        showUpdatePermissions,
        getRedirectUri,
        shouldShowNonAiAgentChatSettingsRevamp,
        isOptedIn,
        appearanceLink,
        openConfirm,
    ])

    return (
        <div className={css.actionsCell}>
            {renderAction()}
            <ChatRedesignSwitchConfirmModal
                isOpen={isConfirmOpen}
                isOptedIn={false}
                isSubmitting={isSubmitting}
                onConfirm={handleConfirmSwitch}
                onOpenChange={setIsConfirmOpen}
            />
        </div>
    )
}
