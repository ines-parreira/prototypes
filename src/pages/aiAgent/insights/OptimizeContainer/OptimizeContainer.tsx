import moment, { Moment } from 'moment'
import { useParams } from 'react-router-dom'

import { INTENT_LEVEL } from 'hooks/reporting/automate/utils'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { OPTIMIZE } from 'pages/aiAgent/constants'
import { IntentTableWidget } from 'pages/aiAgent/insights/IntentTableWidget/IntentTableWidget'
import { AdjustedPeriodFilter } from 'pages/aiAgent/insights/widgets/AdjustedPeriodFilter/AdjustedPeriodFilter'
import { Level1IntentsPerformance } from 'pages/aiAgent/insights/widgets/Level1IntentsPerformance/Level1IntentsPerformance'
import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'

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
                    title="Intents"
                    description="Explore intents detected from AI Agent tickets to assess performance, review knowledge recommendations, and analyze topics within each intent. "
                    tableTitle="All intents"
                    tableHint={{
                        title: 'List of all intents detected in tickets that involved AI Agent.',
                        link: 'https://link.gorgias.com/ac4ad7',
                        linkText: 'Learn about intents',
                    }}
                    intentLevel={INTENT_LEVEL}
                />
            </div>
            <DrillDownModal />
        </AiAgentLayout>
    )
}
