import { useEffect } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import css from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu.less'
import { MAX_DASHBOARDS_ALLOWED } from 'domains/reporting/pages/dashboards/constants'
import type {
    DashboardChild,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import IconInput from 'pages/common/forms/input/IconInput'

export const CREATE_NEW_DASHBOARD_LABEL = 'Create New Dashboard'
export const NO_DASHBOARDS_LABEL = 'No existing dashboards'

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

type Props = {
    chartId: string
    close: () => void
    openModal: () => void
}

export const AddToDashboardPicker = ({ chartId, close, openModal }: Props) => {
    const { addChartToDashboardHandler, getDashboardsHandler } =
        useDashboardActions()

    useEffect(() => {
        logEvent(SegmentEvent.StatDashboardChartMenuAddToChartClicked)
    }, [])

    const dashboards = getDashboardsHandler()
    const filteredDashboards = dashboards.filter(
        (d) => !containsChart(d, chartId),
    )
    const limitReached = dashboards.length >= MAX_DASHBOARDS_ALLOWED

    return (
        <>
            <div className={css.itemsWrapper}>
                {filteredDashboards.length > 0 ? (
                    filteredDashboards.map((d) => (
                        <button
                            key={d.id}
                            className={css.dropdownItem}
                            type="button"
                            onClick={() => {
                                addChartToDashboardHandler({
                                    dashboard: d,
                                    chartId,
                                    onSuccess: close,
                                })
                            }}
                        >
                            {d.emoji && <span>{d.emoji}</span>}
                            <span className={css.dashboardName}>{d.name}</span>
                        </button>
                    ))
                ) : (
                    <div className={css.noDashboards}>
                        {NO_DASHBOARDS_LABEL}
                    </div>
                )}
            </div>

            <button
                type="button"
                className={classNames(
                    css.dropdownItem,
                    css.addToDashboardAction,
                    {
                        [css.disableAddToDashboardAction]: limitReached,
                    },
                )}
                disabled={limitReached}
                onClick={() => {
                    if (!limitReached) {
                        openModal()
                        close()
                    }
                }}
            >
                <IconInput icon="add" />
                {CREATE_NEW_DASHBOARD_LABEL}
            </button>
        </>
    )
}
