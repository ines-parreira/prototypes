import { useMemo } from 'react'

import {
    Box,
    Card,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    DropdownIcon,
    Icon,
    Link,
    Text,
} from '@gorgias/axiom'

import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import type { MessageFeedback } from 'models/aiAgentFeedback/types'

import {
    getActionUrl,
    getGuidanceUrl,
    getKnowledgeUrl,
} from '../../AIAgentFeedbackBar/utils'

type Props = {
    messageId: number
    messageFeedback?: MessageFeedback
}

export const AIAgentUsedDataHelpdeskV2 = ({
    messageId,
    messageFeedback,
}: Props) => {
    const hasAgentPrivileges = useHasAgentPrivileges()
    const { data } = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
    })

    const { orders, actions, knowledge, guidance, shopName, shopType } =
        useMemo(() => {
            const resolvedMessageFeedback =
                messageFeedback ??
                data?.data.messages.find(
                    (message) => message.messageId === messageId,
                )

            if (!resolvedMessageFeedback) {
                return {}
            }

            const { orders, actions, knowledge, guidance, shopName, shopType } =
                resolvedMessageFeedback

            return {
                orders,
                actions,
                knowledge,
                guidance,
                shopName,
                shopType,
            }
        }, [data, messageFeedback, messageId])

    const visibleOrders = orders ?? []
    const visibleActions = actions ?? []
    const visibleGuidance = guidance ?? []
    const visibleKnowledge = knowledge ?? []
    const hasVisibleData =
        visibleOrders.length > 0 ||
        visibleActions.length > 0 ||
        visibleGuidance.length > 0 ||
        visibleKnowledge.length > 0

    if (!hasVisibleData) {
        return null
    }

    return (
        <>
            <Disclosure>
                <DisclosureHeader
                    title={({ isExpanded }: { isExpanded: boolean }) => (
                        <Box gap="xxxs">
                            <Icon name="ai-alt-1" />
                            <Text size="sm" color="content-neutral-secondary">
                                Data Used
                            </Text>
                            <DropdownIcon isOpen={isExpanded} />
                        </Box>
                    )}
                    trailingSlot={null}
                />
                <DisclosurePanel pt="xxs">
                    <Card elevation="mid">
                        <Box
                            gap="xs"
                            flexWrap="wrap"
                            justifyContent="flex-start"
                            width="100%"
                            flexGrow={1}
                        >
                            {visibleOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href={order.url}
                                >
                                    <Box
                                        gap="xxxxs"
                                        alignItems="center"
                                        padding="xxxxs"
                                    >
                                        <Icon name="app-shopify" size="sm" />
                                        <Text
                                            size="sm"
                                            color="content-accent-default"
                                        >
                                            {order.name}
                                        </Text>
                                        <Icon name="external-link" size="sm" />
                                    </Box>
                                </Link>
                            ))}
                            {visibleActions.map((action) => (
                                <Link
                                    key={action.id}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href={
                                        hasAgentPrivileges
                                            ? getActionUrl(
                                                  action,
                                                  shopType ?? '',
                                                  shopName ?? '',
                                              )
                                            : undefined
                                    }
                                >
                                    <Box
                                        gap="xxxxs"
                                        alignItems="center"
                                        padding="xxxxs"
                                    >
                                        <Icon
                                            name="media-play-circle"
                                            size="sm"
                                        />
                                        <Text
                                            size="sm"
                                            color="content-accent-default"
                                        >
                                            {action.name}
                                        </Text>
                                        <Icon name="external-link" size="sm" />
                                    </Box>
                                </Link>
                            ))}
                            {visibleGuidance.map((guidance) => (
                                <Link
                                    key={guidance.id}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href={
                                        hasAgentPrivileges
                                            ? getGuidanceUrl(
                                                  guidance,
                                                  shopType ?? '',
                                                  shopName ?? '',
                                              )
                                            : undefined
                                    }
                                >
                                    <Box
                                        gap="xxxxs"
                                        alignItems="center"
                                        padding="xxxxs"
                                    >
                                        <Icon name="nav-map" size="sm" />
                                        <Text
                                            size="sm"
                                            color="content-accent-default"
                                        >
                                            {guidance.name}
                                        </Text>
                                        <Icon name="external-link" size="sm" />
                                    </Box>
                                </Link>
                            ))}
                            {visibleKnowledge.map((knowledge) => (
                                <Link
                                    key={knowledge.id}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href={
                                        hasAgentPrivileges
                                            ? getKnowledgeUrl(
                                                  knowledge,
                                                  shopType ?? '',
                                                  shopName ?? '',
                                              )
                                            : undefined
                                    }
                                >
                                    <Box
                                        gap="xxxxs"
                                        alignItems="center"
                                        padding="xxxxs"
                                    >
                                        <Icon name="bookmark" size="sm" />
                                        <Text
                                            size="sm"
                                            color="content-accent-default"
                                        >
                                            {knowledge.name}
                                        </Text>
                                        <Icon name="external-link" size="sm" />
                                    </Box>
                                </Link>
                            ))}
                        </Box>
                    </Card>
                </DisclosurePanel>
            </Disclosure>
        </>
    )
}
