import { useState } from 'react'
import type { ReactNode } from 'react'

import type { AnyAction } from '@reduxjs/toolkit'
import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'

import { Box, Icon, Text } from '@gorgias/axiom'
import { TicketMessageSourceType } from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
import type { Customer } from 'models/customer/types'
import SourceIcon from 'pages/common/components/SourceIcon'
import { getDisplayName } from 'state/customers/helpers'

import css from './InfobarCustomerInfo.less'

export const InstagramSection = ({ customer }: { customer: Customer }) => {
    const [showDetails, setShowDetails] = useState(true)

    const isIgSectionEnabled = useFlag(FeatureFlagKey.InstagramUserSection)

    const handleIgHandleClick = (e: AnyAction) => {
        e.preventDefault()

        logEvent(SegmentEvent.InstagramHandleClicked)

        const igProfileUrl = encodeURI(
            `https://www.instagram.com/${getDisplayName(customer as any)}`,
        )

        window.open(igProfileUrl, '_blank', 'noopener noreferrer')
    }

    if (!isIgSectionEnabled) {
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
                        <Icon name="wavy-check" color="blue" />
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
                        <Box flexDirection="row">
                            <Text
                                as="span"
                                className={css.igFollowSection}
                                size="sm"
                            >
                                Following: <Icon name="check" />
                                Follower: <Icon name="close" />
                            </Text>
                        </Box>
                        <Box flexDirection="row" marginBottom="xs">
                            <Icon name="user-add" />
                            <Text as="span" size="sm">
                                14.7K followers
                            </Text>
                        </Box>
                    </Box>
                </div>
            </Box>
        </>
    )
}
