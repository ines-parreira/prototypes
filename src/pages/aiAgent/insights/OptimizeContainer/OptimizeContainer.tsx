import {useFlags} from 'launchdarkly-react-client-sdk'
import moment, {Moment} from 'moment'
import React from 'react'
import {useParams} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import useEffectOnce from 'hooks/useEffectOnce'
import {AiAgentLayout} from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {AI_AGENT, OPTIMIZE} from 'pages/aiAgent/constants'
import {IntentTableWidget} from 'pages/aiAgent/insights/IntentTableWidget/IntentTableWidget'

import {AdjustedPeriodFilter} from 'pages/aiAgent/insights/widgets/AdjustedPeriodFilter/AdjustedPeriodFilter'
import {Level1IntentsPerformance} from 'pages/aiAgent/insights/widgets/Level1IntentsPerformance/Level1IntentsPerformance'
import {DrillDownModal} from 'pages/stats/DrillDownModal'

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
    const {shopName} = useParams<{
        shopName: string
    }>()

    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    useEffectOnce(() => {
        logEvent(SegmentEvent.AiAgentOptimizePageViewed, {
            type: 'Optimize overview',
        })
    })

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={isStandaloneMenuEnabled ? OPTIMIZE : AI_AGENT}
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
                        link: 'https://docs.gorgias.com/en-US/customer-intents-81924',
                        linkText: 'Learn about intents',
                    }}
                />
            </div>
            <DrillDownModal />
        </AiAgentLayout>
    )
}
