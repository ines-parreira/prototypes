import { useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import type { Map } from 'immutable'

import { Box, Icon, Text, LegacyTooltip as Tooltip } from '@gorgias/axiom'
import { queryKeys, useListInstagramProfiles } from '@gorgias/helpdesk-queries'
import { TicketMessageSourceType } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import type { Integration } from 'models/integration/types'
import SourceIcon from 'pages/common/components/SourceIcon'
import { getIntegrations } from 'state/integrations/selectors'
import { getMessages } from 'state/ticket/selectors'
import lastNonSystemTypeMessage from 'tickets/common/utils/lastNonSystemTypeMessage'
import { getFormattedDate } from 'utils/date'

import css from './InfobarCustomerInfo.less'

const formatFollowerCount = (count: number): string => {
    if (count < 1000) {
        return count.toString()
    }

    if (count < 10000) {
        // 1k - 9.9k
        const formatted = (count / 1000).toFixed(1)
        return `${formatted.replace(/\.0$/, '')}k`
    }

    if (count < 100000) {
        // 10k - 99.9k
        const formatted = (count / 1000).toFixed(1)
        return `${formatted.replace(/\.0$/, '')}k`
    }

    if (count < 1000000) {
        // 100k - 999k
        return `${Math.floor(count / 1000)}k`
    }

    if (count < 10000000) {
        // 1M - 9.9M
        const formatted = (count / 1000000).toFixed(1)
        return `${formatted.replace(/\.0$/, '')}M`
    }

    // 10M+
    return `${Math.floor(count / 1000000)}M`
}

export const InstagramSection = ({
    customer,
    igChannel,
}: {
    customer: Map<any, any>
    igChannel?: { address?: string | null } | null
}) => {
    const [showDetails, setShowDetails] = useState(false)
    const messages = useAppSelector(getMessages)
    const lastMessage = lastNonSystemTypeMessage(messages.toJS()) || null
    const messageIntegrationId = lastMessage?.get('integration_id')
    const allIntegrations = useAppSelector(getIntegrations)

    const customerHandle = igChannel?.address ?? null

    const instagramIntegration = allIntegrations.find(
        (integration: Integration) => integration.id === messageIntegrationId,
    )

    const instagramId = (instagramIntegration?.meta as Record<string, any>)
        ?.instagram?.id

    const instagramProfilesParams = {
        customer_id: customer?.get('id'),
        owning_business_id: instagramId,
        limit: 1,
        order_by: 'updated_at:desc' as const,
    }

    const { data: userInstaData } = useListInstagramProfiles(
        instagramProfilesParams,
        {
            query: {
                enabled: !!customer.get('id') && !!instagramId,
                queryKey: queryKeys.integrations.listInstagramProfiles(
                    instagramProfilesParams,
                ),
                staleTime: 60 * 60 * 1000,
                cacheTime: 60 * 60 * 1000,
                select: (resp) => resp?.data?.data?.at(0),
            },
        },
    )

    if (!customerHandle) {
        return null
    }

    const handleIgHandleClick = () => {
        logEvent(SegmentEvent.InstagramHandleClicked)
    }

    if (!userInstaData) {
        return (
            <>
                <Box flex={1} mb="xs">
                    <SourceIcon
                        type={TicketMessageSourceType.Instagram}
                        className={css.igIcon}
                    />
                    <a
                        href={`https://www.instagram.com/${customerHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleIgHandleClick}
                    >
                        @{customerHandle}
                    </a>
                </Box>
            </>
        )
    }
    return (
        <>
            <Box flexDirection="column">
                <Box flex={1} flexDirection="column">
                    <Box gap="xs">
                        <SourceIcon
                            type={TicketMessageSourceType.Instagram}
                            className={css.igIcon}
                        />
                        <a
                            href={`https://www.instagram.com/${userInstaData.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleIgHandleClick}
                        >
                            @{userInstaData.username}
                        </a>
                        {userInstaData?.is_verified && (
                            <Icon name="wavy-check" color="blue" />
                        )}

                        <div
                            onClick={() =>
                                setShowDetails((prevState) => !prevState)
                            }
                            className={css.showDetailsIcon}
                        >
                            <Icon
                                name={`arrow-chevron-${showDetails ? 'up' : 'down'}`}
                            />
                        </div>
                    </Box>
                </Box>
                <div
                    className={classNames(css.hideDetails, {
                        [css.showDetails]: showDetails,
                    })}
                >
                    <Box
                        flexDirection="column"
                        className={css.detailsContent}
                        mt="xxs"
                    >
                        {userInstaData?.name && (
                            <Text className={css.igName} size="sm">
                                {userInstaData.name}
                            </Text>
                        )}
                        <Box flexDirection="row" gap="xs" mb="xs">
                            <Box>
                                <Text
                                    id="tooltip_following"
                                    className={css.igFollowSection}
                                    size="sm"
                                >
                                    Following:{' '}
                                    {userInstaData.business_follows_customer ? (
                                        <Icon name="check" />
                                    ) : (
                                        <Icon name="close" />
                                    )}
                                </Text>
                                {userInstaData.business_follows_customer ? (
                                    <Tooltip target="tooltip_following">
                                        Your business follows this customer on
                                        Instagram
                                    </Tooltip>
                                ) : (
                                    <Tooltip target="tooltip_following">
                                        Your business doesn&apos;t follow this
                                        customer on Instagram
                                    </Tooltip>
                                )}
                            </Box>

                            <Box>
                                <Text
                                    id="tooltip_follower"
                                    className={css.igFollowSection}
                                    size="sm"
                                >
                                    Follower:{' '}
                                    {userInstaData.customer_follows_business ? (
                                        <Icon name="check" />
                                    ) : (
                                        <Icon name="close" />
                                    )}
                                </Text>
                                {userInstaData.customer_follows_business ? (
                                    <Tooltip target="tooltip_follower">
                                        Customer follows your business on
                                        Instagram
                                    </Tooltip>
                                ) : (
                                    <Tooltip target="tooltip_follower">
                                        Customer doesn&apos;t follow your
                                        business on Instagram
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </div>
            </Box>
            <Box alignItems="center" flexDirection="row" gap="xs" mb="xxs">
                <Icon name="user-add" size="md" />
                <Text
                    id="tooltip_updated_at"
                    size="sm"
                    className={css.igFollowers}
                >
                    {formatFollowerCount(userInstaData?.total_followers ?? 0)}{' '}
                    followers
                </Text>
                <Tooltip target="tooltip_updated_at">
                    Profile has been updated on{' '}
                    {getFormattedDate(userInstaData.updated_at, 'en-GB')}
                </Tooltip>
            </Box>
        </>
    )
}
