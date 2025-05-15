import { useParams } from 'react-router-dom'

import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { OPTIMIZE } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { IntentTableWidget } from 'pages/aiAgent/insights/IntentTableWidget/IntentTableWidget'
import { INTENT_LEVEL } from 'pages/aiAgent/insights/OptimizeContainer/OptimizeContainer'
import BackLink from 'pages/common/components/BackLink'
import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'

import { Level2IntentsPerformance } from '../Level2IntentsPerformance/Level2IntentsPerformance'
import { AdjustedPeriodFilter } from '../widgets/AdjustedPeriodFilter/AdjustedPeriodFilter'

import css from '../OptimizeContainer/OptimizeContainer.less'

export const Level2IntentsContainer = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })

    return (
        <AiAgentLayout
            shopName={shopName}
            title={OPTIMIZE}
            className={css.container}
        >
            <div className={css.section}>
                <BackLink
                    path={routes.optimize}
                    label="Back to AI Agent performance"
                />
                <AdjustedPeriodFilter />

                <Level2IntentsPerformance />
            </div>
            <div className={css.section}>
                <IntentTableWidget
                    title="Intent topics"
                    description="Explore intent topics to view related tickets and resources used by AI Agent to find opportunities to improve it’s performance."
                    tableTitle="All topics"
                    intentLevel={INTENT_LEVEL + 1}
                    tableHint={{
                        title: 'List of all intents detected in tickets that involved AI Agent.',
                        link: 'https://docs.gorgias.com/en-US/customer-intents-81924',
                        linkText: 'Learn about intents',
                    }}
                />
            </div>
            <DrillDownModal />
        </AiAgentLayout>
    )
}
