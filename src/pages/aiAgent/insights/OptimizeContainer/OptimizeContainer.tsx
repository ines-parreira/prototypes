import moment, { Moment } from 'moment'
import { useParams } from 'react-router-dom'

import { INTENT_LEVEL } from 'domains/reporting/hooks/automate/utils'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { OPTIMIZE } from 'pages/aiAgent/constants'
import { IntentTableWidget } from 'pages/aiAgent/insights/IntentTableWidget/IntentTableWidget'
import { AdjustedPeriodFilter } from 'pages/aiAgent/insights/widgets/AdjustedPeriodFilter/AdjustedPeriodFilter'
import { Level1IntentsPerformance } from 'pages/aiAgent/insights/widgets/Level1IntentsPerformance/Level1IntentsPerformance'

import css from './OptimizeContainer.less'

const HOURS_TO_REMOVE = 72

export const subtractsPeriodWithoutData = (momentDate: Moment) => {
    return momentDate.subtract(HOURS_TO_REMOVE, 'hours')
}

export const subtractsPeriodWithoutDataIfNeeded = (momentDate: Moment) => {
    if (momentDate.isAfter(moment().subtract(HOURS_TO_REMOVE, 'hours'))) {
        return momentDate.subtract(HOURS_TO_REMOVE, 'hours')
    }

    return momentDate
}

export const OptimizeContainer = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={OPTIMIZE}
        >
            <div className={css.section}>
                <AdjustedPeriodFilter />
                <Level1IntentsPerformance />
            </div>

            <div className={css.section}>
                <IntentTableWidget
                    tableTitle="Performance by intent"
                    tableDescription="Intents are the primary topics identified in tickets. Explore how AI Agent performs across these topics and sub-topics, and identify where better knowledge could improve success or satisfaction. <a href='https://link.gorgias.com/e873df' target='_blank'>Learn more about intents.</a>"
                    intentLevel={INTENT_LEVEL}
                />
            </div>
            <DrillDownModal />
        </AiAgentLayout>
    )
}
