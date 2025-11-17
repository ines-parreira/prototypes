import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AiAgentStatsEmptyState } from 'domains/reporting/pages/automate/ai-agent/AiAgentStatsEmptyState'
import { getStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { setStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/statsSlice'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import AutomatePaywallView from 'pages/automate/common/components/AutomatePaywallView'
import { AutomateFeatures } from 'pages/automate/common/types'

type Props = {
    children?: ReactNode
}

export default function AiAgentStatsFilters({ children }: Props) {
    const dispatch = useAppDispatch()
    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)
    const { hasAccess } = useAiAgentAccess()
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
                !hasAccess ? (
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
