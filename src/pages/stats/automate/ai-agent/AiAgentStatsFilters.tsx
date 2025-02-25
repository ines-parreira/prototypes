import React, { ReactNode, useEffect, useRef, useState } from 'react'

import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { FilterKey } from 'models/stat/types'
import AutomatePaywallView from 'pages/automate/common/components/AutomatePaywallView'
import { AutomateFeatures } from 'pages/automate/common/types'
import { AiAgentStatsEmptyState } from 'pages/stats/automate/ai-agent/AiAgentStatsEmptyState'
import { getHasAutomate } from 'state/billing/selectors'
import { getStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import { setStatsFiltersWithLogicalOperators } from 'state/stats/statsSlice'

type Props = {
    children?: ReactNode
}

export default function AiAgentStatsFilters({ children }: Props) {
    const dispatch = useAppDispatch()
    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)
    const hasAutomate = useAppSelector(getHasAutomate)
    const aiAgentUserId = useAIAgentUserId()

    const [initialStatsFilters] = useState(statsFilters)
    const [isReady, setIsReady] = useState(false)

    const periodRef = useRef(statsFilters.period)

    useEffect(() => {
        if (aiAgentUserId === undefined) {
            setIsReady(true)
            return
        }

        const defaultFilters = {
            [FilterKey.Period]: initialStatsFilters.period,
        }

        dispatch(setStatsFiltersWithLogicalOperators(defaultFilters))
        setIsReady(true)

        return () => {
            dispatch(
                setStatsFiltersWithLogicalOperators({
                    ...initialStatsFilters,
                    period: periodRef.current,
                }),
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        periodRef.current = statsFilters.period
    }, [statsFilters.period])

    return (
        <>
            {isReady ? (
                !hasAutomate ? (
                    <AutomatePaywallView
                        automateFeature={AutomateFeatures.AiAgent}
                    />
                ) : aiAgentUserId === undefined ? (
                    <AiAgentStatsEmptyState />
                ) : (
                    children
                )
            ) : null}
        </>
    )
}
