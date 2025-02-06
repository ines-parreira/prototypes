import classnames from 'classnames'

import React, {useMemo} from 'react'
import {useHistory} from 'react-router-dom'

import cssNavbar from 'assets/css/navbar.less'
import {logEvent, SegmentEvent} from 'common/segment'
import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import useAppSelector from 'hooks/useAppSelector'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import {
    LIMIT_REACHED_MESSAGE,
    MAX_DASHBOARDS_ALLOWED,
} from 'pages/stats/custom-reports/constants'
import css from 'pages/stats/custom-reports/DashboardsNavbarBlock/DashboardsNavbarBlock.less'
import {getCurrentUser} from 'state/currentUser/selectors'
import {isTeamLead} from 'utils'

type Props = {
    navBarLinkProps: Partial<NavbarLinkProps>
}

export const DASHBOARDS_NAV_TITLE = 'DASHBOARDS'
export const CREATE_DASHBOARD = 'Create new dashboard'
export const RESTRICTION_MESSAGE = 'Reach out to your admin for dashboard setup'

const logStatDashboardNavCreateChartClicked = () => {
    logEvent(SegmentEvent.StatDashboardNavCreateChartClicked)
}

export const DashboardsNavbarBlock = ({navBarLinkProps}: Props) => {
    const history = useHistory()
    const {getDashboardsHandler} = useCustomReportActions()

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
                          history.push('/app/stats/custom-reports/new')
                          logEvent(
                              SegmentEvent.StatDashboardNavCreateChartClicked
                          )
                      },
                  },
        ],
        [history, limitReached]
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
            {dashboards.map(({name, id, emoji}) => (
                <div
                    key={id}
                    className={classnames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested
                    )}
                >
                    <NavbarLink
                        {...navBarLinkProps}
                        to={`/app/stats/custom-reports/${id}`}
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
