import React, {useRef, useState} from 'react'

import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import {CustomReportChild} from 'models/stat/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import IconInput from 'pages/common/forms/input/IconInput'
import css from 'pages/stats/custom-reports/ChartsActionMenu/ChartsActionMenu.less'
import {
    CustomReportChildType,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'

export const ADD_TO_DASHBOARD = 'Add to dashboard'
export const REMOVE_FROM_DASHBOARD = 'Delete chart from dashboard'

const ActionMenuItem = ({
    dashboard,
    updateDashboard,
}: {
    dashboard: CustomReportSchema
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
    (hasChart: boolean, dashboardChild: CustomReportChild): boolean => {
        if (dashboardChild.type !== CustomReportChildType.Chart) {
            return dashboardChild.children.reduce(
                childrenContainChart(chartId),
                hasChart
            )
        } else if (dashboardChild.config_id === chartId) {
            return true
        }
        return hasChart
    }

const containsChart = (dashboard: CustomReportSchema, chartId: string) => {
    return dashboard.children.reduce(childrenContainChart(chartId), false)
}

export const ChartsActionMenu = ({
    chartId,
    dashboard,
}: {
    chartId: string
    dashboard?: CustomReportSchema
}) => {
    const toggleRef = useRef(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const [showActions, setShowActions] = useState(false)
    const {
        addChartToDashboardHandler,
        getDashboardsHandler,
        removeChartFromDashboardHandler,
    } = useCustomReportActions()

    const handleToggleDropdown = () => {
        setShowDropdown(!showDropdown)
        setShowActions(false)
    }

    const filteredDashboards = getDashboardsHandler().filter(
        (dashboard) => !containsChart(dashboard, chartId)
    )

    return (
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
                <DropdownBody>
                    {showActions ? (
                        filteredDashboards.map((dashboard) => (
                            <ActionMenuItem
                                dashboard={dashboard}
                                key={dashboard.id}
                                updateDashboard={() => {
                                    addChartToDashboardHandler({
                                        dashboard,
                                        chartId,
                                        onClose: handleToggleDropdown,
                                    })
                                }}
                            />
                        ))
                    ) : (
                        <>
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
                            {dashboard !== undefined && (
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
                        </>
                    )}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
