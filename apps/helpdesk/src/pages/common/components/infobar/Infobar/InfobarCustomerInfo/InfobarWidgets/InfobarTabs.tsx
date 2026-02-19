import { useCallback } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import cn from 'classnames'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { Nav, Navbar, NavItem, NavLink } from 'reactstrap'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { getWidgetId } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'

import css from './InfobarTabs.less'

type Props = {
    widgetNames: string[]
}

export function InfobarTabs({ widgetNames }: Props) {
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()
    const { ticketId, customerId } = useParams<{
        ticketId: string
        customerId: string
    }>()
    const history = useHistory()
    const location = useLocation()
    const tabs: Set<string> = new Set(widgetNames)

    const toggleTicketWidgetEditionMode = useCallback(() => {
        if (!ticketId && !customerId) {
            return
        }

        const path = ticketId
            ? `/app/ticket/${ticketId}`
            : `/app/customer/${customerId}`

        logEvent(SegmentEvent.InfobarEditWidgetsClicked)
        const isEditing = location.pathname.includes('/edit-widgets')

        if (isEditing) {
            history.push(`${path}`)
        } else {
            history.push(`${path}/edit-widgets`)
        }
    }, [ticketId, history, location.pathname, customerId])

    if (tabs.size < 2) {
        return null
    }

    return (
        <Navbar
            className={cn(css.container, {
                [css.hasUIVisionMS1]: hasUIVisionMS1,
            })}
            sticky="top"
        >
            <Nav pills>
                {Array.from(tabs).map((tab, idx) => {
                    const widgetId = getWidgetId(tab)
                    return (
                        <NavItem key={idx}>
                            <NavLink href={`#${widgetId}`} className={css.tab}>
                                {tab}
                            </NavLink>
                        </NavItem>
                    )
                })}
            </Nav>
            {hasUIVisionMS1 && (
                <Tooltip>
                    <Button
                        icon="settings"
                        variant="tertiary"
                        onClick={toggleTicketWidgetEditionMode}
                    />
                    <TooltipContent title="Edit widgets" />
                </Tooltip>
            )}
        </Navbar>
    )
}
