import { useMemo, useState } from 'react'

import { Box, ButtonGroup, ButtonGroupItem, Heading } from '@gorgias/axiom'

import { useSaveSelectedTable } from './hooks/useSaveSelectedTable'
import type {
    DashboardComponentType,
    DashboardLayoutConfig,
    LayoutItem,
    LayoutReportConfig,
    LayoutSection,
} from './types'

import css from './TablesSection.less'

type TablesSectionProps<TChart extends string> = {
    section: LayoutSection<TChart>
    reportConfig: LayoutReportConfig<TChart>
    dashboardId?: string
    layoutConfig?: DashboardLayoutConfig<TChart>
    tabId?: string
    tabName?: string
    onTabChange?: (key: string) => void
    DashboardComponent: DashboardComponentType<TChart>
    enableTablesPersistence?: boolean
    enableCustomDashboards?: boolean
    isItemVisible?: (item: LayoutItem<TChart>) => boolean
}

function getSelectedTableIdFromVisibility<TChart extends string>(
    items: LayoutSection<TChart>['items'],
) {
    return items.find((item) => item.visibility)?.chartId ?? ''
}

function getActiveTableId<TChart extends string>({
    items,
    isPersistenceEnabled,
    persistedSelectedId,
    localSelectedId,
}: {
    items: LayoutSection<TChart>['items']
    isPersistenceEnabled: boolean
    persistedSelectedId: string
    localSelectedId: string | null
}) {
    const fallbackTableId = items[0]?.chartId || ''

    if (isPersistenceEnabled) {
        return persistedSelectedId || fallbackTableId
    }

    if (
        localSelectedId &&
        items.some((item) => item.chartId === localSelectedId)
    ) {
        return localSelectedId
    }

    return fallbackTableId
}

export function TablesSection<TChart extends string>({
    section,
    reportConfig,
    dashboardId,
    layoutConfig,
    tabId,
    tabName,
    onTabChange,
    DashboardComponent,
    enableTablesPersistence = false,
    enableCustomDashboards = false,
    isItemVisible,
}: TablesSectionProps<TChart>) {
    const availableItems = section.items.filter((item) =>
        isItemVisible ? isItemVisible(item) : true,
    )

    const selectedTableId = useMemo(
        () => getSelectedTableIdFromVisibility(availableItems),
        [availableItems],
    )

    const { onSelect: saveSelectedTable } = useSaveSelectedTable({
        dashboardId,
        tabId,
        tabName,
        layoutConfig: layoutConfig ?? { sections: [section] },
    })
    const [localActiveTableId, setLocalActiveTableId] = useState<string | null>(
        null,
    )

    const activeTableId = useMemo(() => {
        return getActiveTableId({
            items: availableItems,
            isPersistenceEnabled: enableTablesPersistence,
            persistedSelectedId: selectedTableId,
            localSelectedId: localActiveTableId,
        })
    }, [
        availableItems,
        enableTablesPersistence,
        localActiveTableId,
        selectedTableId,
    ])

    if (availableItems.length === 0) {
        return null
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            flex={1}
            gap="xxxs"
            minWidth="0px"
        >
            {section.tableTitle && (
                <Box className={css.header}>
                    <Heading size="sm" className={css.title}>
                        {section.tableTitle}
                    </Heading>
                </Box>
            )}
            <div className={css.tableContainer}>
                {availableItems.length > 1 && (
                    <div className={css.tabs}>
                        <ButtonGroup
                            selectedKey={activeTableId}
                            onSelectionChange={(key: string) => {
                                if (enableTablesPersistence) {
                                    saveSelectedTable(key)
                                } else {
                                    setLocalActiveTableId(key)
                                }
                                onTabChange?.(key)
                            }}
                        >
                            {availableItems.map((item) => (
                                <ButtonGroupItem
                                    key={item.chartId}
                                    id={item.chartId}
                                >
                                    {reportConfig.charts[item.chartId].label}
                                </ButtonGroupItem>
                            ))}
                        </ButtonGroup>
                    </div>
                )}
                {availableItems
                    .filter((item) => activeTableId === item.chartId)
                    .map((item) => (
                        <DashboardComponent
                            key={item.chartId}
                            chart={item.chartId}
                            config={reportConfig}
                            withChartMenu={enableCustomDashboards}
                        />
                    ))}
            </div>
        </Box>
    )
}
