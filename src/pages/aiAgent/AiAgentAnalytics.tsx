import { useParams } from 'react-router-dom'

import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import SalesOverview from 'pages/stats/automate/aiSalesAgent/components/SalesOverview'
import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'
import DefaultStatsFilters from 'pages/stats/DefaultStatsFilters'

import { SALES } from './constants'

import css from './AiAgentAnalytics.less'

export const AiAgentAnalytics = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    return (
        <DefaultStatsFilters>
            <DrillDownModal />
            <AiAgentLayout
                className={css.container}
                shopName={shopName}
                title={SALES}
            >
                <SalesOverview />
            </AiAgentLayout>
        </DefaultStatsFilters>
    )
}
