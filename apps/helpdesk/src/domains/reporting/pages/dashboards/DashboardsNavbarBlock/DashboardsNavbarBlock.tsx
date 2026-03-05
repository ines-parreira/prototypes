import { useCallback, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { NavLink, useHistory } from 'react-router-dom'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { Navigation } from 'components/Navigation/Navigation'
import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { StatsNavbarViewSections } from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
import {
    LIMIT_REACHED_MESSAGE,
    MAX_DASHBOARDS_ALLOWED,
} from 'domains/reporting/pages/dashboards/constants'
import css from 'domains/reporting/pages/dashboards/DashboardsNavbarBlock/DashboardsNavbarBlock.less'
import { getDashboardPath } from 'domains/reporting/pages/dashboards/utils'
import useAppSelector from 'hooks/useAppSelector'
import IconInput from 'pages/common/forms/input/IconInput'
import { BASE_STATS_PATH, STATS_ROUTES } from 'routes/constants'
import { analyticsSections } from 'routes/layout/products/analytics'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

export const CREATE_NEW_DASHBOARD = 'Create new dashboard'
export const DASHBOARDS_NAV_TITLE = 'Dashboards'
export const RESTRICTION_MESSAGE = 'Reach out to your admin for dashboard setup'

const logStatDashboardNavCreateChartClicked = () => {
    logEvent(SegmentEvent.StatDashboardNavCreateChartClicked)
}

const actionsIconId = 'actions-icon'

const CREATE_DASHBOARD_PATH = `${BASE_STATS_PATH}/${STATS_ROUTES.DASHBOARDS_NEW}`

export const DashboardsNavbarBlock = () => {
    const [isOpen, setOpen] = useState(false)
    const { getDashboardsHandler } = useDashboardActions()
    const currentUser = useAppSelector(getCurrentUser)
    const history = useHistory()
    const dashboards = getDashboardsHandler()
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
                      label: CREATE_NEW_DASHBOARD,
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

    const handleActionsClick = useCallback(() => {
        setOpen(!isOpen)
        logStatDashboardNavCreateChartClicked()
    }, [isOpen, setOpen])

    return (
        <Navigation.Section
            value={analyticsSections[StatsNavbarViewSections.Dashboards].id}
            icon={analyticsSections[StatsNavbarViewSections.Dashboards].icon}
        >
            <div className={css.actionsContainer}>
                <Navigation.SectionTrigger
                    data-candu-id="navbar-block-dashboards"
                    icon={
                        analyticsSections[StatsNavbarViewSections.Dashboards]
                            .icon
                    }
                >
                    <span className={css.sectionTriggerTitle}>
                        {DASHBOARDS_NAV_TITLE}
                    </span>
                    <Navigation.SectionIndicator />
                </Navigation.SectionTrigger>
                <Dropdown
                    isOpen={isOpen}
                    disabled={!isCurrentUserTeamLead}
                    toggle={handleActionsClick}
                >
                    <DropdownToggle
                        className={classNames(css.toggle, 'btn-transparent')}
                        color="ghost"
                        type="button"
                    >
                        <IconInput
                            id={actionsIconId}
                            icon={isCurrentUserTeamLead ? 'add' : 'info'}
                            isOutlined={!isCurrentUserTeamLead}
                        />
                        {!isCurrentUserTeamLead && (
                            <Tooltip
                                target={actionsIconId}
                                placement="bottom-end"
                            >
                                {RESTRICTION_MESSAGE}
                            </Tooltip>
                        )}
                    </DropdownToggle>
                    <DropdownMenu right>
                        {actions.map((action) => (
                            <DropdownItem
                                className={classNames(css.action)}
                                key={action.label}
                                onClick={action.onClick}
                            >
                                {action.label}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            </div>

            <Navigation.SectionContent className={css.sectionContent}>
                {dashboards.map(({ name, id, emoji }) => (
                    <Navigation.SectionItem
                        key={id}
                        as={NavLink}
                        exact
                        to={getDashboardPath(id)}
                        className={css.navbarLink}
                        displayType="indent"
                    >
                        {emoji && <span>{emoji}</span>}
                        <div className={css.name}>{name}</div>
                    </Navigation.SectionItem>
                ))}
            </Navigation.SectionContent>
        </Navigation.Section>
    )
}
