import { useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'

import { Box } from '@gorgias/axiom'

import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'

import { AnalyticsOverviewReportConfig } from '../../AnalyticsOverviewReportConfig'
import type {
    DashboardLayoutConfig,
    LayoutSection,
} from '../../types/layoutConfig'
import { validateLayoutConfig } from '../../utils/validateLayoutConfig'

import css from './DashboardLayoutRenderer.less'

type DashboardLayoutRendererProps = {
    layoutConfig: DashboardLayoutConfig
}

const KpisSection = ({ section }: { section: LayoutSection }) => {
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
                        config={AnalyticsOverviewReportConfig}
                    />
                </motion.div>
            ))}
        </motion.div>
    )
}

const renderSection = (section: LayoutSection) => {
    const isChartsSection = section.type === 'charts'
    const isKpisSection = section.type === 'kpis'
    const isTableSection = section.type === 'table'

    if (isKpisSection) {
        return <KpisSection key={section.id} section={section} />
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
                        config={AnalyticsOverviewReportConfig}
                    />
                </Box>
            ))}
        </Box>
    )
}

export const DashboardLayoutRenderer = ({
    layoutConfig,
}: DashboardLayoutRendererProps) => {
    const validatedConfig = validateLayoutConfig(layoutConfig)

    return (
        <Box
            display="flex"
            flexDirection="column"
            p="lg"
            gap="lg"
            minWidth="0px"
            className={css.container}
        >
            {validatedConfig.sections.map(renderSection)}
        </Box>
    )
}
