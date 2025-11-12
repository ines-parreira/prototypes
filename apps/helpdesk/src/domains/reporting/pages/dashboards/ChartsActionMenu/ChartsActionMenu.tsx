import React, { ReactNode, useRef, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { AddChartToDashboardModal } from 'domains/reporting/pages/dashboards/ChartsActionMenu/AddChartToDashboardModal'
import css from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu.less'
import { MAX_DASHBOARDS_ALLOWED } from 'domains/reporting/pages/dashboards/constants'
import {
    DashboardChild,
    DashboardChildType,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import useAppSelector from 'hooks/useAppSelector'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import IconInput from 'pages/common/forms/input/IconInput'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

export const ADD_TO_DASHBOARD = 'Add To Dashboard'
export const CREATE_NEW_DASHBOARD_LABEL = 'Create New Dashboard'
export const REMOVE_FROM_DASHBOARD = 'Remove chart from dashboard'
export const NO_DASHBOARDS_LABEL = 'No existing dashboards'

const ActionMenuItem = ({
    dashboard,
    updateDashboard,
}: {
    dashboard: DashboardSchema
    updateDashboard: () => void
}) => {
    return (
        <DropdownItem
            key={dashboard.id}
            onClick={updateDashboard}
            className={css.dropdownItem}
            option={{
                label: dashboard.name,
                value: dashboard.id,
            }}
            shouldCloseOnSelect
        >
            {dashboard.emoji && <span>{dashboard.emoji}</span>}
            {dashboard.name}
        </DropdownItem>
    )
}

const childrenContainChart =
    (chartId: string) =>
    (hasChart: boolean, dashboardChild: DashboardChild): boolean => {
        if (dashboardChild.type !== DashboardChildType.Chart) {
            return dashboardChild.children.reduce(
                childrenContainChart(chartId),
                hasChart,
            )
        } else if (dashboardChild.config_id === chartId) {
            return true
        }
        return hasChart
    }

const containsChart = (dashboard: DashboardSchema, chartId: string) => {
    return dashboard.children.reduce(childrenContainChart(chartId), false)
}

export const ChartsActionMenu = ({
    chartName,
    chartId,
    dashboard,
}: {
    chartId: string
    chartName: ReactNode
    dashboard?: DashboardSchema
}) => {
    const toggleRef = useRef(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const [showActions, setShowActions] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const {
        addChartToDashboardHandler,
        getDashboardsHandler,
        removeChartFromDashboardHandler,
    } = useDashboardActions()

    const currentUser = useAppSelector(getCurrentUser)
    const isCurrentUserTeamLead = isTeamLead(currentUser)

    if (!isCurrentUserTeamLead) {
        return null
    }

    const handleToggleDropdown = () => {
        setShowDropdown(!showDropdown)
        setShowActions(false)
        logEvent(SegmentEvent.StatDashboardChartMenuAddToChartClicked)
    }

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    const dashboards = getDashboardsHandler()

    const filteredDashboards = dashboards.filter(
        (dashboard) => !containsChart(dashboard, chartId),
    )

    const limitReached = dashboards.length >= MAX_DASHBOARDS_ALLOWED

    return (
        <>
            <div
                ref={toggleRef}
                className={css.wrapper}
                onClick={handleToggleDropdown}
            >
                <IconInput className={css.moreVertIcon} icon="more_vert" />
                <Dropdown
                    isOpen={showDropdown}
                    offset={4}
                    placement="bottom-end"
                    target={toggleRef}
                    onToggle={handleToggleDropdown}
                >
                    <DropdownBody className={css.dropdownWrapper}>
                        {showActions ? (
                            <>
                                <div className={css.itemsWrapper}>
                                    {filteredDashboards.length > 0 ? (
                                        filteredDashboards.map((dashboard) => (
                                            <ActionMenuItem
                                                dashboard={dashboard}
                                                key={dashboard.id}
                                                updateDashboard={() => {
                                                    addChartToDashboardHandler({
                                                        dashboard,
                                                        chartId,
                                                        onSuccess:
                                                            handleToggleDropdown,
                                                    })
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <div className={css.noDashboards}>
                                            {NO_DASHBOARDS_LABEL}
                                        </div>
                                    )}
                                </div>

                                <DropdownItem
                                    onClick={handleOpenModal}
                                    className={classNames(
                                        css.dropdownItem,
                                        css.addToDashboardAction,
                                        {
                                            [css.disableAddToDashboardAction]:
                                                limitReached,
                                        },
                                    )}
                                    isDisabled={limitReached}
                                    shouldCloseOnSelect
                                    option={{
                                        label: CREATE_NEW_DASHBOARD_LABEL,
                                        value: CREATE_NEW_DASHBOARD_LABEL,
                                    }}
                                >
                                    <IconInput
                                        icon="add"
                                        className={css.dropdownLeftIcon}
                                    />
                                    {CREATE_NEW_DASHBOARD_LABEL}
                                </DropdownItem>
                            </>
                        ) : (
                            <div className={css.itemsWrapper}>
                                <DropdownItem
                                    onClick={() => setShowActions(true)}
                                    className={css.dropdownItem}
                                    option={{
                                        label: ADD_TO_DASHBOARD,
                                        value: ADD_TO_DASHBOARD,
                                    }}
                                >
                                    <IconInput
                                        icon="add"
                                        className={css.dropdownLeftIcon}
                                    />
                                    {ADD_TO_DASHBOARD}

                                    <IconInput
                                        className={css.chevronRightIcon}
                                        icon="chevron_right"
                                    />
                                </DropdownItem>
                                {dashboard && (
                                    <DropdownItem
                                        onClick={() =>
                                            removeChartFromDashboardHandler({
                                                dashboard,
                                                chartId,
                                            })
                                        }
                                        className={css.dropdownItem}
                                        option={{
                                            label: REMOVE_FROM_DASHBOARD,
                                            value: REMOVE_FROM_DASHBOARD,
                                        }}
                                    >
                                        <IconInput
                                            icon="delete_outline"
                                            className={css.dropdownLeftIcon}
                                        />
                                        {REMOVE_FROM_DASHBOARD}
                                    </DropdownItem>
                                )}
                            </div>
                        )}
                    </DropdownBody>
                </Dropdown>
            </div>
            {isModalOpen && (
                <AddChartToDashboardModal
                    closeModal={() => setIsModalOpen(false)}
                    chartName={chartName}
                    chartId={chartId}
                />
            )}
        </>
    )
}
