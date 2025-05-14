import { useCallback, useMemo, useState } from 'react'

import classNames from 'classnames'
import { NavLink, useHistory } from 'react-router-dom'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { Navigation } from 'components/Navigation/Navigation'
import { useDashboardActions } from 'hooks/reporting/dashboards/useDashboardActions'
import useAppSelector from 'hooks/useAppSelector'
import IconInput from 'pages/common/forms/input/IconInput'
import { StatsNavbarViewSections } from 'pages/stats/common/components/StatsNavbarViewV2/constants'
import {
    LIMIT_REACHED_MESSAGE,
    MAX_DASHBOARDS_ALLOWED,
} from 'pages/stats/dashboards/constants'
import { RESTRICTION_MESSAGE } from 'pages/stats/dashboards/DashboardsNavbarBlock/DashboardsNavbarBlock'
import css from 'pages/stats/dashboards/DashboardsNavbarBlock/DashboardsNavbarBlockV2.less'
import { getDashboardPath } from 'pages/stats/dashboards/utils'
import { BASE_STATS_PATH, STATS_ROUTES } from 'routes/constants'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

export const CREATE_NEW_DASHBOARD = 'Create new dashboard'
export const DASHBOARDS_NAV_TITLE = 'Dashboards'

const logStatDashboardNavCreateChartClicked = () => {
    logEvent(SegmentEvent.StatDashboardNavCreateChartClicked)
}

const actionsIconId = 'actions-icon'

const CREATE_DASHBOARD_PATH = `${BASE_STATS_PATH}/${STATS_ROUTES.DASHBOARDS_NEW}`

export const DashboardsNavbarBlockV2 = () => {
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
        <Navigation.Section value={StatsNavbarViewSections.Dashboards}>
            <div className={css.actionsContainer}>
                <Navigation.SectionTrigger data-candu-id="navbar-block-dashboards">
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
