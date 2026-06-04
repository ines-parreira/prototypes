import { useCallback, useEffect, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { SearchableItemPicker } from '@repo/reporting'

import { Icon, Text } from '@gorgias/axiom'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import css from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu.less'
import { MAX_DASHBOARDS_ALLOWED } from 'domains/reporting/pages/dashboards/constants'
import type {
    DashboardChild,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'

export const CREATE_NEW_DASHBOARD_LABEL = 'Create new dashboard'
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
    goBack?: () => void
    openModal: () => void
    defaultOpen?: boolean
}

export const AddToDashboardPicker = ({
    chartId,
    close,
    goBack,
    openModal,
    defaultOpen = false,
}: Props) => {
    const { addChartToDashboardHandler, getDashboardsHandler } =
        useDashboardActions()
    const [isPickerOpen, setIsPickerOpen] = useState(defaultOpen)

    useEffect(() => {
        logEvent(SegmentEvent.StatDashboardChartMenuAddToChartClicked)
    }, [])

    const dashboards = getDashboardsHandler()
    const filteredDashboards = dashboards.filter(
        (d) => !containsChart(d, chartId),
    )
    const limitReached = dashboards.length >= MAX_DASHBOARDS_ALLOWED

    const closePicker = useCallback(() => {
        setIsPickerOpen(false)
        close()
    }, [close])

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsPickerOpen(open)
            if (!open) close()
        },
        [close],
    )

    const handleSelect = useCallback(
        (id: string) => {
            const dashboard = filteredDashboards.find(
                (d) => String(d.id) === id,
            )
            if (dashboard) {
                addChartToDashboardHandler({
                    dashboard,
                    chartId,
                    onSuccess: closePicker,
                })
            }
        },
        [filteredDashboards, addChartToDashboardHandler, chartId, closePicker],
    )

    const sections = [
        {
            id: 'dashboards',
            items: filteredDashboards.map((d) => ({
                id: String(d.id),
                label: d.name,
                leadingSlot: d.emoji ? <span>{d.emoji}</span> : undefined,
                trailingSlot: <Icon name="arrow-chevron-right" size="sm" />,
            })),
        },
    ]

    return (
        <SearchableItemPicker
            sections={sections}
            onSelect={handleSelect}
            isOpen={isPickerOpen}
            onOpenChange={handleOpenChange}
            placeholder="Search..."
            header={
                goBack !== undefined && (
                    <button
                        type="button"
                        className={css.pickerBackButton}
                        onClick={goBack}
                    >
                        <Icon name="arrow-chevron-left" size="sm" />
                        Add to dashboard
                    </button>
                )
            }
            footer={
                <>
                    {filteredDashboards.length === 0 && (
                        <Text
                            size="sm"
                            color="var(--content-neutral-secondary)"
                        >
                            {NO_DASHBOARDS_LABEL}
                        </Text>
                    )}
                    <button
                        type="button"
                        className={css.addToDashboardAction}
                        disabled={limitReached}
                        onClick={() => {
                            if (!limitReached) {
                                closePicker()
                                openModal()
                            }
                        }}
                    >
                        {CREATE_NEW_DASHBOARD_LABEL}
                    </button>
                </>
            }
        />
    )
}
