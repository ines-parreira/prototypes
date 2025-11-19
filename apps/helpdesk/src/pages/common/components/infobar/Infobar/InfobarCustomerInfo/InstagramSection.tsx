import { useState } from 'react'
import type { ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'

import { Box, Icon, Text } from '@gorgias/axiom'
import {
    type ListInstagramProfiles200,
    TicketMessageSourceType,
} from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
import type { Customer } from 'models/customer/types'
import SourceIcon from 'pages/common/components/SourceIcon'
import { getDisplayName } from 'state/customers/helpers'

import css from './InfobarCustomerInfo.less'

const formatFollowerCount = (count: number): string => {
    if (count < 1000) {
        return count.toString()
    }

    if (count < 10000) {
        // 1k - 9.9k (show one decimal place)
        const formatted = (count / 1000).toFixed(1)
        return `${formatted.replace(/\.0$/, '')}k`
    }

    if (count < 100000) {
        // 10k - 99.9k (show one decimal place)
        const formatted = (count / 1000).toFixed(1)
        return `${formatted.replace(/\.0$/, '')}k`
    }

    if (count < 1000000) {
        // 100k - 999k (no decimal places)
        return `${Math.floor(count / 1000)}k`
    }

    if (count < 10000000) {
        // 1M - 9.9M (show one decimal place)
        const formatted = (count / 1000000).toFixed(1)
        return `${formatted.replace(/\.0$/, '')}M`
    }

    // 10M+ (no decimal places)
    return `${Math.floor(count / 1000000)}M`
}

export const InstagramSection = ({
    customer,
    userInstaData,
}: {
    customer: Customer
    userInstaData: ListInstagramProfiles200 | undefined
}) => {
    const [showDetails, setShowDetails] = useState(true)

    const isIgSectionEnabled = useFlag(FeatureFlagKey.InstagramUserSection)

    const handleIgHandleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()

        logEvent(SegmentEvent.InstagramHandleClicked)

        const igProfileUrl = encodeURI(
            `https://www.instagram.com/${getDisplayName(customer as any)}`,
        )

        window.open(igProfileUrl, '_blank', 'noopener noreferrer')
    }

    const localData = userInstaData?.data?.[0]

    if (!isIgSectionEnabled || !localData) {
        return (
            <>
                <Box flex={1} mb="xs">
                    <SourceIcon
                        type={TicketMessageSourceType.Instagram}
                        className={css.igIcon}
                    />
                    <a href="/#" onClick={handleIgHandleClick}>
                        @{getDisplayName(customer as any) as ReactNode}
                    </a>
                </Box>
            </>
        )
    }
    return (
        <>
            <Box flexDirection="column">
                <Box flex={1} flexDirection="column" mb="xs">
                    <Box>
                        <SourceIcon
                            type={TicketMessageSourceType.Instagram}
                            className={css.igIcon}
                        />
                        <a href="/#" onClick={handleIgHandleClick}>
                            @{getDisplayName(customer as any) as ReactNode}
                        </a>
                        {localData?.is_verified && (
                            <Icon name="wavy-check" color="blue" />
                        )}

                        <div
                            onClick={() =>
                                setShowDetails((prevState) => !prevState)
                            }
                            className={css.showDetailsIcon}
                        >
                            <Icon
                                name={`arrow-chevron-${showDetails ? 'down' : 'up'}`}
                            />
                        </div>
                    </Box>
                </Box>
                <div
                    className={classNames(css.hideDetails, {
                        [css.showDetails]: !showDetails,
                    })}
                >
                    <Box flexDirection="column" className={css.detailsContent}>
                        <Box flexDirection="column">
                            <Text className={css.igName} size="sm">
                                {localData?.name}
                            </Text>
                            <Text className={css.igFollowSection} size="sm">
                                Following:{' '}
                                {localData?.business_follows_customer ? (
                                    <Icon name="check" />
                                ) : (
                                    <Icon name="close" />
                                )}
                                Follower:{' '}
                                {localData?.customer_follows_business ? (
                                    <Icon name="check" />
                                ) : (
                                    <Icon name="close" />
                                )}
                            </Text>
                        </Box>
                        <Box flexDirection="row" marginBottom="xs">
                            <Icon name="user-add" />
                            <Text
                                as="span"
                                size="sm"
                                className={css.igFollowers}
                            >
                                {formatFollowerCount(
                                    localData?.total_followers ?? 0,
                                )}{' '}
                                followers
                            </Text>
                        </Box>
                    </Box>
                </div>
            </Box>
        </>
    )
}
