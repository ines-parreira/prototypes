import {useFlags} from 'launchdarkly-react-client-sdk'

import React from 'react'

import {useParams} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'

import {AiAgentLayout} from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {AI_AGENT, OPTIMIZE} from 'pages/aiAgent/constants'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import BackLink from 'pages/common/components/BackLink'

import {DrillDownModal} from 'pages/stats/DrillDownModal'

import {Level2IntentsPerformance} from '../Level2IntentsPerformance/Level2IntentsPerformance'

import css from '../OptimizeContainer/OptimizeContainer.less'
import {AdjustedPeriodFilter} from '../widgets/AdjustedPeriodFilter/AdjustedPeriodFilter'

export const Level2IntentsContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})

    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    return (
        <AiAgentLayout
            shopName={shopName}
            title={isStandaloneMenuEnabled ? OPTIMIZE : AI_AGENT}
            className={css.container}
        >
            <div className={css.section}>
                <BackLink
                    path={routes.optimize}
                    label="Back To AI Agent Performance"
                />
                <AdjustedPeriodFilter />

                <Level2IntentsPerformance />
            </div>
            <DrillDownModal />
        </AiAgentLayout>
    )
}
