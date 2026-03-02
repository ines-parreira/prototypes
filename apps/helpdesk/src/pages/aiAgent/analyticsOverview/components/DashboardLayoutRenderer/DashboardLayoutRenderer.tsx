import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { ShowMoreList } from '@repo/reporting'
import type { MetricConfigItem } from '@repo/reporting'
import { motion } from 'framer-motion'

import { Box } from '@gorgias/axiom'

import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import css from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer.less'
import { MetricsConfigurator } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/MetricsConfigurator'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from 'pages/aiAgent/analyticsOverview/config/defaultLayoutConfig'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    LayoutItem,
    LayoutSection,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { validateLayoutConfig } from 'pages/aiAgent/analyticsOverview/utils/validateLayoutConfig'

type DashboardLayoutRendererProps<TChart extends string> = {
    layoutConfig: DashboardLayoutConfig
    reportConfig: ReportConfig<TChart>
    tabKey?: string
}

const getEntranceAnimation = (index: number) => {
    const animations = [
        { x: -50, y: -30 },
        { x: -25, y: -20 },
        { x: 50, y: -30 },
        { x: 25, y: -20 },
    ]
    return animations[index % animations.length]
}

const renderKpiItem = (
    item: LayoutItem,
    index: number,
    tabKey: string | undefined,
    reportConfig: ReportConfig<AnalyticsChartType>,
) => {
    const entrance = getEntranceAnimation(index)

    return (
        <motion.div
            key={tabKey ? `${tabKey}-${item.chartId}` : item.chartId}
            initial={{
                x: entrance.x,
                y: entrance.y,
                opacity: 0,
            }}
            animate={{
                x: 0,
                y: 0,
                opacity: 1,
            }}
            transition={{
                x: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: index * 0.05,
                },
                y: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: index * 0.05,
                },
                opacity: { duration: 0.7, delay: index * 0.05 },
            }}
            className={css.kpiItem}
        >
            <DashboardComponent chart={item.chartId} config={reportConfig} />
        </motion.div>
    )
}

const KpisSection = ({
    section,
    reportConfig,
    tabKey,
}: {
    section: LayoutSection
    reportConfig: ReportConfig<AnalyticsChartType>
    tabKey?: string
}) => {
    const isAnalyticsDashboardsTrendCardsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )

    const visibleItems = section.items.filter(
        (item) =>
            item.visibility &&
            (!item.requiresFeatureFlag ||
                isAnalyticsDashboardsTrendCardsEnabled),
    )

    const keyKpisConfig: MetricConfigItem[] = section.items.map((item) => ({
        id: item.chartId,
        label: reportConfig.charts[item.chartId].label,
        visibility: item.visibility,
    }))

    return isAnalyticsDashboardsTrendCardsEnabled ? (
        <>
            <MetricsConfigurator metrics={keyKpisConfig} />
            <ShowMoreList containerClassName={css.kpisSection}>
                {visibleItems.map((item, index) =>
                    renderKpiItem(item, index, tabKey, reportConfig),
                )}
            </ShowMoreList>
        </>
    ) : (
        <div className={css.kpisSection}>
            {visibleItems.map((item, index) =>
                renderKpiItem(item, index, tabKey, reportConfig),
            )}
        </div>
    )
}

const renderSection =
    (reportConfig: ReportConfig<AnalyticsChartType>, tabKey?: string) =>
    (section: LayoutSection) => {
        const isChartsSection = section.type === 'charts'
        const isKpisSection = section.type === 'kpis'
        const isTableSection = section.type === 'table'

        if (isKpisSection) {
            return (
                <KpisSection
                    key={section.id}
                    section={section}
                    reportConfig={reportConfig}
                    tabKey={tabKey}
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
                        minWidth={
                            isChartsSection
                                ? '300px'
                                : isTableSection
                                  ? '0px'
                                  : undefined
                        }
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

export const DashboardLayoutRenderer = ({
    layoutConfig,
    reportConfig,
    tabKey,
}: DashboardLayoutRendererProps<string>) => {
    const validatedConfig = validateLayoutConfig(
        layoutConfig,
        reportConfig,
        DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
    )

    return (
        <Box
            display="flex"
            flexDirection="column"
            p="lg"
            gap="lg"
            minWidth="0px"
            className={css.container}
        >
            {validatedConfig.sections.map(renderSection(reportConfig, tabKey))}
        </Box>
    )
}
