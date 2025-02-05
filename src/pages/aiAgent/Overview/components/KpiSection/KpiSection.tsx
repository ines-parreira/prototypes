import React from 'react'

import {Kpi} from 'pages/aiAgent/components/Kpi/Kpi'
import {CardTitle} from 'pages/aiAgent/Onboarding/components/Card'
import {Subtitle} from 'pages/aiAgent/Onboarding/components/Subtitle/Subtitle'
import {OverviewCard} from 'pages/aiAgent/Overview/components/OverviewCard/OverviewCard'
import {useAiAgentType} from 'pages/aiAgent/Overview/hooks/useAiAgentType'

import {useMixedKpis} from 'pages/aiAgent/Overview/hooks/useMixedKpis'
import {useSalesKpis} from 'pages/aiAgent/Overview/hooks/useSalesKpis'
import {useSupportKpis} from 'pages/aiAgent/Overview/hooks/useSupportKpis'

import {KpiMetric} from 'pages/aiAgent/Overview/types'

import css from './KpiSection.less'

const KpiContainer = ({
    isLoading = false,
    metrics,
}: {
    isLoading?: boolean
    metrics?: KpiMetric[]
}) => {
    if (isLoading || !metrics?.length) {
        return (
            <div className={css.kpiContainer}>
                <Kpi isLoading />
                <Kpi isLoading />
                <Kpi isLoading />
                <Kpi isLoading />
            </div>
        )
    }

    return (
        <div className={css.kpiContainer}>
            {metrics.map((metric) => {
                return (
                    <Kpi
                        key={metric.title}
                        isLoading={metric.isLoading}
                        value={metric.value}
                        prevValue={metric.prevValue}
                        title={metric.title}
                        hint={metric.hint}
                        metricType={metric.metricType}
                    />
                )
            })}
        </div>
    )
}

const SalesKpi = () => {
    const {metrics} = useSalesKpis()
    return <KpiContainer metrics={metrics} />
}
const SupportKpi = () => {
    const {metrics} = useSupportKpis()
    return <KpiContainer metrics={metrics} />
}
const MixedKpi = () => {
    const {metrics} = useMixedKpis()
    return <KpiContainer metrics={metrics} />
}

const KpiForAiAgentType = ({
    isLoading,
    aiAgentType,
}: {
    isLoading: boolean
    aiAgentType?: 'sales' | 'support' | 'mixed'
}) => {
    if (isLoading || !aiAgentType) {
        return <KpiContainer isLoading />
    }

    switch (aiAgentType) {
        case 'sales':
            return <SalesKpi />
        case 'support':
            return <SupportKpi />
        case 'mixed':
            return <MixedKpi />
    }
}

export const KpiSection = () => {
    const {isLoading, data} = useAiAgentType()

    return (
        <OverviewCard>
            <div>
                <CardTitle>AI Agent Performance</CardTitle>
                <Subtitle>Data from last 28 days</Subtitle>
            </div>

            <KpiForAiAgentType
                aiAgentType={data?.aiAgentType}
                isLoading={isLoading}
            />
        </OverviewCard>
    )
}
