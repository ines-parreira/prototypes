import { useMemo } from 'react'

import type { Map } from 'immutable'

import {
    Button,
    ButtonAs,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Icon,
    IconName,
    Tag,
    TagColor,
} from '@gorgias/axiom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

type AiAgentStatusProps = {
    chat: Map<any, any>
}

export function AiAgentStatusCell({ chat }: AiAgentStatusProps) {
    const { storeIntegration, isConnected } = useStoreIntegration(chat)
    const shopName = storeIntegration?.name as string

    const currentAccount = useAppSelector(getCurrentAccountState)

    const { storeConfiguration, isLoading: isLoadingStoreConfiguration } =
        useStoreConfiguration({
            shopName,
            accountDomain: currentAccount.get('domain'),
        })

    const { hasAccess, isLoading: isLoadingAiAgentAccess } =
        useAiAgentAccess(shopName)

    const isLoading = useMemo(
        () => isLoadingStoreConfiguration || isLoadingAiAgentAccess,
        [isLoadingStoreConfiguration, isLoadingAiAgentAccess],
    )
    const hasSubscriptionAccess = useMemo(() => {
        return Boolean(hasAccess && shopName && isConnected)
    }, [shopName, hasAccess, isConnected])

    const isAiAgentEnabled = useMemo(() => {
        if (!storeConfiguration) {
            return false
        }

        return (
            storeConfiguration.monitoredChatIntegrations.includes(
                chat.get('id') as number,
            ) && !storeConfiguration.chatChannelDeactivatedDatetime
        )
    }, [chat, storeConfiguration])

    if (isLoading) {
        return <Tag color={TagColor.Grey}>Loading...</Tag>
    }

    if (!isConnected) {
        return <Tag color={TagColor.Grey}>No store connected</Tag>
    }

    if (!hasSubscriptionAccess && storeIntegration) {
        return (
            <div
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                <Button
                    target="_blank"
                    href={`/app/ai-agent/${storeIntegration.type}/${shopName}`}
                    as={ButtonAs.Anchor}
                    size={ButtonSize.Sm}
                    leadingSlot={IconName.AiAgentFeedback}
                    variant={ButtonVariant.Secondary}
                    intent={ButtonIntent.Regular}
                >
                    Try AI agent
                </Button>
            </div>
        )
    }

    return (
        <Tag
            color={isAiAgentEnabled ? TagColor.Green : TagColor.Red}
            leadingSlot={
                <Icon
                    name={isAiAgentEnabled ? IconName.Check : IconName.Close}
                />
            }
        >
            {isAiAgentEnabled ? 'Enabled' : 'Disabled'}
        </Tag>
    )
}
