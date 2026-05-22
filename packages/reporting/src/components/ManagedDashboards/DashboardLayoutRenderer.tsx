import { Box } from '@gorgias/axiom'

import { DashboardContext } from '../../contexts/DashboardContext'
import { CardsSection } from './CardsSection'
import { useGetManagedDashboardsLayoutConfig } from './hooks/useGetManagedDashboardsLayoutConfig'
import { TablesSection } from './TablesSection'
import type {
    DashboardComponentType,
    DashboardLayoutConfig,
    LayoutItem,
    LayoutReportConfig,
    LayoutSection,
} from './types'
import { ChartType } from './types'

type DashboardLayoutRendererProps<TChart extends string> = {
    defaultLayoutConfig: DashboardLayoutConfig<TChart>
    reportConfig: LayoutReportConfig<TChart>
    dashboardId: string
    tabId: string
    tabName: string
    DashboardComponent: DashboardComponentType<TChart>
    onTableTabChange?: (key: string) => void
    enableTrendCards?: boolean
    enableCustomDashboards?: boolean
    enableTablesPersistence?: boolean
    isItemVisible?: (item: LayoutItem<TChart>) => boolean
    enableLayoutFetch?: boolean
}

export function DashboardLayoutRenderer<TChart extends string>({
    defaultLayoutConfig,
    reportConfig,
    dashboardId,
    tabId,
    tabName,
    DashboardComponent,
    onTableTabChange,
    enableTrendCards,
    enableCustomDashboards,
    enableTablesPersistence,
    isItemVisible,
    enableLayoutFetch = true,
}: DashboardLayoutRendererProps<TChart>) {
    const { layoutConfig, isLoading } = useGetManagedDashboardsLayoutConfig({
        dashboardId,
        defaultLayoutConfig,
        tabId,
        enabled: enableLayoutFetch,
    })

    return (
        <DashboardContext.Provider
            value={{
                dashboardId,
                tabId,
                tabName,
                layoutConfig,
                isLoaded: !isLoading,
            }}
        >
            <Box
                display="flex"
                flexDirection="column"
                p="lg"
                gap="lg"
                minWidth="0px"
                width="100%"
                maxWidth="100%"
                style={{ overflowX: 'hidden' }}
            >
                {layoutConfig.sections.map((section) =>
                    renderSection({
                        section,
                        reportConfig,
                        tabId,
                        tabName,
                        dashboardId,
                        layoutConfig,
                        onTableTabChange,
                        DashboardComponent,
                        enableTrendCards,
                        enableCustomDashboards,
                        enableTablesPersistence,
                        isItemVisible,
                    }),
                )}
            </Box>
        </DashboardContext.Provider>
    )
}

type RenderSectionParams<TChart extends string> = {
    section: LayoutSection<TChart>
    reportConfig: LayoutReportConfig<TChart>
    tabId: string
    tabName: string
    dashboardId: string
    layoutConfig: DashboardLayoutConfig<TChart>
    onTableTabChange: ((key: string) => void) | undefined
    DashboardComponent: DashboardComponentType<TChart>
    enableTrendCards?: boolean
    enableCustomDashboards?: boolean
    enableTablesPersistence?: boolean
    isItemVisible?: (item: LayoutItem<TChart>) => boolean
}

function renderSection<TChart extends string>({
    section,
    reportConfig,
    tabId,
    tabName,
    dashboardId,
    layoutConfig,
    onTableTabChange,
    DashboardComponent,
    enableTrendCards,
    enableCustomDashboards,
    enableTablesPersistence,
    isItemVisible,
}: RenderSectionParams<TChart>) {
    const isChartsSection = section.type === ChartType.Graph
    const isCardsSection =
        section.type === ChartType.Card ||
        section.type === ChartType.CardWithTimeseries
    const isTableSection = section.type === ChartType.Table

    if (isTableSection) {
        return (
            <TablesSection
                key={`${tabId}-${section.id}`}
                section={section}
                reportConfig={reportConfig}
                dashboardId={dashboardId}
                layoutConfig={layoutConfig}
                tabId={tabId}
                tabName={tabName}
                onTabChange={onTableTabChange}
                DashboardComponent={DashboardComponent}
                enableTablesPersistence={enableTablesPersistence}
                enableCustomDashboards={enableCustomDashboards}
                isItemVisible={isItemVisible}
            />
        )
    }

    if (isCardsSection) {
        return (
            <CardsSection
                key={section.id}
                section={section}
                reportConfig={reportConfig}
                tabId={tabId}
                dashboardId={dashboardId}
                layoutConfig={layoutConfig}
                tabName={tabName}
                DashboardComponent={DashboardComponent}
                enableTrendCards={enableTrendCards}
                enableCustomDashboards={enableCustomDashboards}
            />
        )
    }

    return (
        <Box
            key={section.id}
            display="flex"
            gap="md"
            width="100%"
            minWidth="0px"
            flexWrap={isChartsSection ? 'wrap' : undefined}
        >
            {section.items.map((item) => (
                <Box
                    key={item.chartId}
                    flex={1}
                    minWidth={isChartsSection ? '300px' : undefined}
                >
                    <DashboardComponent
                        chart={item.chartId}
                        config={reportConfig}
                    />
                </Box>
            ))}
        </Box>
    )
}
