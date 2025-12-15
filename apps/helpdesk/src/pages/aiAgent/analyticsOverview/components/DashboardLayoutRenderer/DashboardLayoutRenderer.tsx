import { useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'

import { Box } from '@gorgias/axiom'

import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'

import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../../config/defaultLayoutConfig'
import type {
    DashboardLayoutConfig,
    LayoutSection,
} from '../../types/layoutConfig'
import { validateLayoutConfig } from '../../utils/validateLayoutConfig'

import css from './DashboardLayoutRenderer.less'

type DashboardLayoutRendererProps<TChart extends string> = {
    layoutConfig: DashboardLayoutConfig
    reportConfig: ReportConfig<TChart>
}

const KpisSection = <TChart extends string>({
    section,
    reportConfig,
}: {
    section: LayoutSection
    reportConfig: ReportConfig<TChart>
}) => {
    const [isWrapped, setIsWrapped] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isScrollable, setIsScrollable] = useState(false)

    useEffect(() => {
        const checkScrollable = () => {
            if (containerRef.current) {
                const hasOverflow =
                    containerRef.current.scrollWidth >
                    containerRef.current.clientWidth
                setIsScrollable(hasOverflow)
            }
        }

        checkScrollable()
        window.addEventListener('resize', checkScrollable)
        return () => window.removeEventListener('resize', checkScrollable)
    }, [])

    const handleClick = () => {
        if (isScrollable) {
            setIsWrapped(!isWrapped)
        }
    }

    return (
        <motion.div
            ref={containerRef}
            onClick={handleClick}
            className={`${css.kpisSection} ${isScrollable ? css.clickable : ''} ${isWrapped ? css.wrapped : ''}`}
        >
            {section.items.map((item) => (
                <motion.div
                    key={item.chartId}
                    layout="position"
                    animate={{
                        width: isWrapped ? '100%' : 'auto',
                    }}
                    initial={false}
                    transition={{
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
                    className={css.kpiItem}
                >
                    <DashboardComponent
                        chart={item.chartId}
                        config={reportConfig}
                    />
                </motion.div>
            ))}
        </motion.div>
    )
}

const renderSection =
    <TChart extends string>(reportConfig: ReportConfig<TChart>) =>
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

export const DashboardLayoutRenderer = <TChart extends string>({
    layoutConfig,
    reportConfig,
}: DashboardLayoutRendererProps<TChart>) => {
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
            {validatedConfig.sections.map(renderSection(reportConfig))}
        </Box>
    )
}
