import { motion } from 'framer-motion'

import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import css from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer.less'
import type {
    AnalyticsChartType,
    LayoutItem,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

const getEntranceAnimation = (index: number) => {
    const animations = [
        { x: -50, y: -30 },
        { x: -25, y: -20 },
        { x: 50, y: -30 },
        { x: 25, y: -20 },
    ]
    return animations[index % animations.length]
}

type KpiItemAnimatedProps = {
    item: LayoutItem
    index: number
    tabKey: string | undefined
    reportConfig: ReportConfig<AnalyticsChartType>
}

export const AnimatedTrendCard = ({
    item,
    index,
    tabKey,
    reportConfig,
}: KpiItemAnimatedProps) => {
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
