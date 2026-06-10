import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'

import { useParams } from 'react-router-dom'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarTicketCustomerDetails } from '../InfobarTicketCustomerDetails/InfobarTicketCustomerDetails'
import { InfobarTicketDetailsContainer } from './components/InfobarTicketDetailsContainer'
import { TicketInfobarTicketDetailsTags } from './components/InfobarTicketTags'
import { InfobarTicketDetailsHeader } from './components/InforbarTicketDetailsHeader'
import { TicketInfobarTicketFields } from './components/TicketInfobarTicketFields'
import css from './components/InfobarTicketDetailsContainer.less'

type InfobarTicketDetailsProps = {
    ticketSummaryIcon: ReactNode
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    onSwitchCustomer?: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
}

export function InfobarTicketDetails({
    ticketSummaryIcon,
    onEditCustomer,
    onSyncToShopify,
    onSwitchCustomer,
    hasShopifyIntegration,
}: InfobarTicketDetailsProps) {
    const { ticketId } = useParams<{ ticketId: string }>()
    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)
    const showToggle = hasNewOrdersSidebar

    const [isExpanded, setIsExpanded] = useState(true)
    const toggle = useCallback(() => setIsExpanded((v) => !v), [])

    if (!ticketId || ticketId === 'new') {
        return null
    }

    return (
        <>
            <InfobarTicketDetailsContainer>
                <InfobarTicketDetailsHeader
                    ticketSummaryIcon={ticketSummaryIcon}
                    isExpanded={showToggle ? isExpanded : undefined}
                    onToggle={showToggle ? toggle : undefined}
                />
                {(!showToggle || isExpanded) && (
                    <>
                        <TicketInfobarTicketDetailsTags ticketId={ticketId} />
                        <TicketInfobarTicketFields ticketId={ticketId} />
                    </>
                )}
            </InfobarTicketDetailsContainer>
            {hasNewOrdersSidebar && <div className={css.sectionSpacer} />}
            <InfobarTicketCustomerDetails
                onEditCustomer={onEditCustomer}
                onSyncToShopify={onSyncToShopify}
                onSwitchCustomer={onSwitchCustomer}
                hasShopifyIntegration={hasShopifyIntegration}
                ticketId={ticketId}
            />
        </>
    )
}
