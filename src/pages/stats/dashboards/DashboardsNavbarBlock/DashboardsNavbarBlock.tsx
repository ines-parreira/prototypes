import React, { useMemo } from 'react'

import classnames from 'classnames'
import { useHistory } from 'react-router-dom'

import cssNavbar from 'assets/css/navbar.less'
import { logEvent, SegmentEvent } from 'common/segment'
import { useDashboardActions } from 'hooks/reporting/dashboards/useDashboardActions'
import useAppSelector from 'hooks/useAppSelector'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import {
    LIMIT_REACHED_MESSAGE,
    MAX_DASHBOARDS_ALLOWED,
} from 'pages/stats/dashboards/constants'
import css from 'pages/stats/dashboards/DashboardsNavbarBlock/DashboardsNavbarBlock.less'
import { getDashboardPath } from 'pages/stats/dashboards/utils'
import { BASE_STATS_PATH, STATS_ROUTES } from 'routes/constants'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

type Props = {
    navBarLinkProps: Partial<NavbarLinkProps>
}

export const DASHBOARDS_NAV_TITLE = 'DASHBOARDS'
export const CREATE_DASHBOARD = 'Create new dashboard'
export const RESTRICTION_MESSAGE = 'Reach out to your admin for dashboard setup'

const logStatDashboardNavCreateChartClicked = () => {
    logEvent(SegmentEvent.StatDashboardNavCreateChartClicked)
}

const CREATE_DASHBOARD_PATH = `${BASE_STATS_PATH}/${STATS_ROUTES.DASHBOARDS_NEW}`

export const DashboardsNavbarBlock = ({ navBarLinkProps }: Props) => {
    const history = useHistory()
    const { getDashboardsHandler } = useDashboardActions()

    const dashboards = getDashboardsHandler()

    const currentUser = useAppSelector(getCurrentUser)
    const isCurrentUserTeamLead = isTeamLead(currentUser)

    const limitReached = dashboards.length >= MAX_DASHBOARDS_ALLOWED

    const actions = useMemo(
        () => [
            limitReached
                ? {
                      label: LIMIT_REACHED_MESSAGE,
                      onClick: () => {},
                  }
                : {
                      label: CREATE_DASHBOARD,
                      onClick: () => {
                          history.push(CREATE_DASHBOARD_PATH)
                          logEvent(
                              SegmentEvent.StatDashboardNavCreateChartClicked,
                          )
                      },
                  },
        ],
        [history, limitReached],
    )

    const actionsIcon = {
        name: isCurrentUserTeamLead ? 'add' : 'info',
        isOutlined: !isCurrentUserTeamLead,
        isDisabled: !isCurrentUserTeamLead,
        tooltip: isCurrentUserTeamLead ? undefined : RESTRICTION_MESSAGE,
        callback: logStatDashboardNavCreateChartClicked,
    }

    return (
        <NavbarBlock
            icon="insert_chart"
            actionsIcon={actionsIcon}
            title={DASHBOARDS_NAV_TITLE}
            dropdownClassName={limitReached ? css.action : ''}
            actions={actions}
            className={css.navbar}
        >
            {dashboards.map(({ name, id, emoji }) => (
                <div
                    key={id}
                    className={classnames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested,
                    )}
                >
                    <NavbarLink
                        {...navBarLinkProps}
                        to={getDashboardPath(id)}
                        className={css.wrapper}
                    >
                        {emoji && <span>{emoji}</span>}
                        <div className={css.name}>{name}</div>
                    </NavbarLink>
                </div>
            ))}
        </NavbarBlock>
    )
}
