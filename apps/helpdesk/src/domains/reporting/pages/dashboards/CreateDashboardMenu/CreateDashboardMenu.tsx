import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'

import { Button, Menu, MenuItem, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import {
    LIMIT_REACHED_MESSAGE,
    MAX_DASHBOARDS_ALLOWED,
} from 'domains/reporting/pages/dashboards/constants'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { BASE_STATS_PATH, STATS_ROUTES } from 'routes/constants'

const CREATE_NEW_DASHBOARD = 'Create new dashboard'
const RESTRICTION_MESSAGE = 'Reach out to your admin for dashboard setup'
const CREATE_DASHBOARD_PATH = `${BASE_STATS_PATH}/${STATS_ROUTES.DASHBOARDS_NEW}`

export const CreateDashboardMenu = () => {
    const { getDashboardsHandler } = useDashboardActions()
    const dashboards = getDashboardsHandler()
    const isCurrentUserTeamLead = useHasAgentPrivileges()
    const limitReached = dashboards.length >= MAX_DASHBOARDS_ALLOWED

    if (!isCurrentUserTeamLead) {
        return (
            <Tooltip
                trigger={
                    <Button
                        icon="info"
                        variant="tertiary"
                        size="sm"
                        aria-label="Dashboard restriction info"
                    />
                }
            >
                <TooltipContent>{RESTRICTION_MESSAGE}</TooltipContent>
            </Tooltip>
        )
    }

    return (
        <Menu
            trigger={
                <Button
                    icon="add-plus-circle"
                    variant="tertiary"
                    size="sm"
                    aria-label={CREATE_NEW_DASHBOARD}
                />
            }
        >
            <MenuItem
                id="create-dashboard"
                label={
                    limitReached ? LIMIT_REACHED_MESSAGE : CREATE_NEW_DASHBOARD
                }
                isDisabled={limitReached}
                onAction={() => {
                    history.push(CREATE_DASHBOARD_PATH)
                    logEvent(SegmentEvent.StatDashboardNavCreateChartClicked)
                }}
            />
        </Menu>
    )
}
