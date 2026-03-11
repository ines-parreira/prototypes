import { useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { getFormattedDate } from '@repo/utils'

import {
    Box,
    Heading,
    Icon,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
    Text,
} from '@gorgias/axiom'
import type { TicketCustomer, TicketMessage } from '@gorgias/helpdesk-types'

import { FieldRow } from '../InfobarCustomerFields/components/FieldRow'
import { useCustomerInstagramHandle } from './useCustomerInstagramHandle'
import { useCustomerInstagramProfile } from './useCustomerInstagramProfile'

import css from './InfobarTicketCustomerInstagramSection.less'

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

type InfobarTicketCustomerInstagramSectionProps = {
    customer: TicketCustomer
    messages: TicketMessage[]
}

export const InfobarTicketCustomerInstagramSection = ({
    customer,
    messages,
}: InfobarTicketCustomerInstagramSectionProps) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const customerInstagramHandle = useCustomerInstagramHandle(customer)
    const { data: customerInstagramProfile } = useCustomerInstagramProfile({
        customer,
        messages,
    })

    if (!customerInstagramHandle) {
        return null
    }

    const handleIgHandleClick = () => {
        logEvent(SegmentEvent.InstagramHandleClicked)
    }

    if (!customerInstagramProfile) {
        return (
            <Box
                className={css.instagramContainer}
                flexDirection="column"
                gap="xs"
                padding="md"
                paddingBottom="sm"
            >
                <Heading size="sm" className={css.heading}>
                    Instagram
                </Heading>
                <FieldRow label="Handle">
                    <a
                        href={`https://www.instagram.com/${customerInstagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleIgHandleClick}
                        className={css.instagramHandle}
                    >
                        <Text size="sm">@{customerInstagramHandle}</Text>
                    </a>
                </FieldRow>
            </Box>
        )
    }

    return (
        <Box
            className={css.instagramContainer}
            flexDirection="column"
            gap="xs"
            padding="md"
            paddingBottom="sm"
        >
            <Heading size="sm" className={css.heading}>
                Instagram
            </Heading>
            <OverflowList
                nonExpandedLineCount={2}
                className={css.overflowList}
                isExpanded={isExpanded}
                onExpandedChange={setIsExpanded}
                gap="xxxxs"
                key={`instagram-overflow-list-${customer.id}-${isExpanded}`}
            >
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label="Handle">
                        <a
                            href={`https://www.instagram.com/${customerInstagramProfile.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleIgHandleClick}
                            className={css.instagramHandle}
                            data-verified={
                                customerInstagramProfile?.is_verified
                            }
                        >
                            <Text size="sm">@{customerInstagramHandle}</Text>
                            {customerInstagramProfile?.is_verified && (
                                <Icon name="wavy-check" color="blue" />
                            )}
                        </a>
                    </FieldRow>
                </OverflowListItem>
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label="Followers">
                        <Text size="sm" className={css.fieldValue}>
                            {formatFollowerCount(
                                customerInstagramProfile?.total_followers ?? 0,
                            )}
                        </Text>
                    </FieldRow>
                </OverflowListItem>
                {customerInstagramProfile?.name && (
                    <OverflowListItem className={css.overflowListItem}>
                        <FieldRow label="Profile name">
                            <Text size="sm" className={css.fieldValue}>
                                {customerInstagramProfile.name}
                            </Text>
                        </FieldRow>
                    </OverflowListItem>
                )}
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label="Following you">
                        <Text size="sm" className={css.fieldValue}>
                            {customerInstagramProfile.customer_follows_business
                                ? 'Yes'
                                : 'No'}
                        </Text>
                    </FieldRow>
                </OverflowListItem>
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label="Followed by you">
                        <Text size="sm" className={css.fieldValue}>
                            {customerInstagramProfile.business_follows_customer
                                ? 'Yes'
                                : 'No'}
                        </Text>
                    </FieldRow>
                </OverflowListItem>
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label="Profile updated at">
                        <Text size="sm" className={css.fieldValue}>
                            {getFormattedDate(
                                customerInstagramProfile.updated_at,
                                'en-GB',
                            )}
                        </Text>
                    </FieldRow>
                </OverflowListItem>
                <Box className={css.overflowListToggle}>
                    <OverflowListShowMore
                        leadingSlot="arrow-chevron-down"
                        className={css.overflowListToggle}
                    >
                        Show more
                    </OverflowListShowMore>
                </Box>
                <Box className={css.overflowListToggle}>
                    <OverflowListShowLess leadingSlot="arrow-chevron-up">
                        Show less
                    </OverflowListShowLess>
                </Box>
            </OverflowList>
        </Box>
    )
}
