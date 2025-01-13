import React, {useRef, useState} from 'react'

import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import IconInput from 'pages/common/forms/input/IconInput'
import css from 'pages/stats/custom-reports/ChartsActionMenu/ChartsActionMenu.less'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'

export const ADD_TO_DASHBOARD = 'Add to dashboard'

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

export const ChartsActionMenu = ({chartId}: {chartId: string}) => {
    const toggleRef = useRef(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const [showActions, setShowActions] = useState(false)
    const {addChartToDashboardHandler, getDashboardsHandler} =
        useCustomReportActions()

    const handleToggleDropdown = () => {
        setShowDropdown(!showDropdown)
        setShowActions(false)
    }

    const dashboards = getDashboardsHandler()

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
                        dashboards.map((dashboard) => (
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
                        <DropdownItem
                            onClick={() => setShowActions(true)}
                            className={css.dropdownItem}
                            option={{
                                label: ADD_TO_DASHBOARD,
                                value: ADD_TO_DASHBOARD,
                            }}
                        >
                            {ADD_TO_DASHBOARD}
                            <IconInput
                                className="material-icons"
                                icon="chevron_right"
                            />
                        </DropdownItem>
                    )}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
