import { useEffect, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { type MetricConfigItem } from '@repo/reporting'
import { motion } from 'framer-motion'

import { Box } from '@gorgias/axiom'

import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import css from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer.less'
import { MetricsConfigurator } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/MetricsConfigurator'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from 'pages/aiAgent/analyticsOverview/config/defaultLayoutConfig'
import type {
    AnalyticsAIAgentCharts,
    DashboardLayoutConfig,
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

const KpisSection = ({
    section,
    reportConfig,
    tabKey,
}: {
    section: LayoutSection
    reportConfig: ReportConfig<AnalyticsAIAgentCharts>
    tabKey?: string
}) => {
    const isAnalyticsDashboardsTrendCardsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )
    const [isWrapped, setIsWrapped] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isScrollable, setIsScrollable] = useState(false)
    const [animationComplete, setAnimationComplete] = useState(
        section.items.length === 0,
    )

    useEffect(() => {
        if (!animationComplete) return

        const checkScrollable = () => {
            if (containerRef.current) {
                const hasOverflow =
                    containerRef.current.scrollWidth >
                    containerRef.current.clientWidth
                setIsScrollable(hasOverflow)
            }
        }

        checkScrollable()

        const resizeObserver = new ResizeObserver(() => {
            checkScrollable()
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => {
            resizeObserver.disconnect()
        }
    }, [animationComplete])

    const handleClick = () => {
        if (isScrollable) {
            setIsWrapped(!isWrapped)
        }
    }

    const lastItemIndex = section.items.length - 1

    const keyKpisConfig: MetricConfigItem[] = section.items.map((item) => ({
        id: item.chartId,
        label: reportConfig.charts[item.chartId].label,
        visibility: item.visibility,
    }))

    return (
        <>
            {isAnalyticsDashboardsTrendCardsEnabled && (
                <MetricsConfigurator metrics={keyKpisConfig} />
            )}
            <motion.div
                ref={containerRef}
                onClick={handleClick}
                className={`${css.kpisSection} ${isScrollable ? css.clickable : ''} ${isWrapped ? css.wrapped : ''}`}
            >
                {section.items
                    .filter((item) => item.visibility)
                    .map((item, index) => {
                        const entrance = getEntranceAnimation(index)
                        const isLastItem = index === lastItemIndex

                        return (
                            <motion.div
                                key={
                                    tabKey
                                        ? `${tabKey}-${item.chartId}`
                                        : item.chartId
                                }
                                layout="position"
                                initial={{
                                    x: entrance.x,
                                    y: entrance.y,
                                    opacity: 0,
                                }}
                                animate={{
                                    x: 0,
                                    y: 0,
                                    opacity: 1,
                                    width: isWrapped ? '100%' : 'auto',
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
                                    opacity: {
                                        duration: 0.7,
                                        delay: index * 0.05,
                                    },
                                    width: {
                                        duration: 0.7,
                                        type: 'spring',
                                        stiffness: 100,
                                        damping: 15,
                                    },
                                    layout: {
                                        duration: 0.7,
                                        type: 'spring',
                                        stiffness: 100,
                                        damping: 15,
                                    },
                                }}
                                onAnimationComplete={
                                    isLastItem
                                        ? () => setAnimationComplete(true)
                                        : undefined
                                }
                                className={css.kpiItem}
                            >
                                <DashboardComponent
                                    chart={item.chartId}
                                    config={reportConfig}
                                />
                            </motion.div>
                        )
                    })}
            </motion.div>
        </>
    )
}

const renderSection =
    (reportConfig: ReportConfig<AnalyticsAIAgentCharts>, tabKey?: string) =>
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
