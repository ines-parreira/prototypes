import { useCallback, useMemo } from 'react'

import { useListIntents } from 'models/helpCenter/queries'

import { INTENT_DESCRIPTIONS } from '../components/IntentsTable/intentDescriptions'
import type { ArticleInIntentDto, IntentResponseDto } from '../types'
import { IntentStatus } from '../types'
import { formatIntentName } from '../utils'
import { useIntentsMetrics } from './useIntentsMetrics'

export interface IntentMetrics {
    ticketVolume: number
    ticketVolumePercent: number
    handoverCount: number
    handoverPercent: number
}

export type ToggleState = 'enabled' | 'disabled'

export const HANDOVER_ONLY_INTENTS = ['other::no reply', 'other::spam']

export interface TransformedIntent {
    id: string
    name: string
    formattedName: string
    description?: string
    parentId?: string
    children?: TransformedIntent[]
    metrics?: IntentMetrics
    toggleState: ToggleState
    status?: IntentStatus
    articles?: ArticleInIntentDto[]
}

const calculateL1ToggleState = (children: TransformedIntent[]): ToggleState => {
    if (children.length === 0) return 'enabled'

    const hasEnabledChild = children.some(
        (child) => child.toggleState === 'enabled',
    )

    return hasEnabledChild ? 'enabled' : 'disabled'
}

export const useIntentsTable = (helpCenterId: number) => {
    const { data, isLoading, isError } = useListIntents(helpCenterId, {
        enabled: !!helpCenterId,
    })

    const {
        data: metricsMap,
        isLoading: isMetricsLoading,
        isError: isMetricsError,
        metricsDateRange,
    } = useIntentsMetrics(!!helpCenterId)

    const transformedIntents = useMemo<TransformedIntent[]>(() => {
        if (!data?.intents) return []

        const l1ParentsMap = new Map<string, TransformedIntent>()
        const childrenMap = new Map<string, TransformedIntent[]>()

        data.intents.forEach((intent: IntentResponseDto) => {
            const parts = intent.name.split('::')
            if (parts.length !== 2) {
                return
            }

            const l1Name = parts[0]
            const l2Name = parts[1]

            const publishedArticles = intent.articles.filter(
                (article) => article.status === 'published',
            )

            const isHandoverOnlyIntent = HANDOVER_ONLY_INTENTS.includes(
                intent.name,
            )

            const toggleState =
                !isHandoverOnlyIntent && intent.status !== IntentStatus.Handover
                    ? 'enabled'
                    : 'disabled'

            const intentStatus = isHandoverOnlyIntent
                ? IntentStatus.Handover
                : (intent.status as IntentStatus)

            if (!l1ParentsMap.has(l1Name)) {
                l1ParentsMap.set(l1Name, {
                    id: l1Name,
                    name: l1Name,
                    formattedName: formatIntentName(l1Name),
                    toggleState: 'enabled',
                    children: [],
                })
            }

            const l2Intent: TransformedIntent = {
                id: intent.name,
                name: intent.name,
                formattedName: formatIntentName(l2Name),
                description: INTENT_DESCRIPTIONS[intent.name],
                toggleState,
                status: intentStatus,
                parentId: l1Name,
                articles: publishedArticles,
                metrics: metricsMap.get(intent.name),
            }

            if (!childrenMap.has(l1Name)) {
                childrenMap.set(l1Name, [])
            }
            childrenMap.get(l1Name)!.push(l2Intent)
        })

        l1ParentsMap.forEach((parentIntent, parentName) => {
            const children = childrenMap.get(parentName) ?? []
            parentIntent.children = children
            parentIntent.toggleState = calculateL1ToggleState(children)
            parentIntent.metrics = metricsMap.get(parentName)
        })

        return Array.from(l1ParentsMap.values())
    }, [data, metricsMap])

    const findIntent = useCallback(
        (intentId: string): TransformedIntent | undefined => {
            for (const intent of transformedIntents) {
                if (intent.id === intentId) return intent
                const child = intent.children?.find((c) => c.id === intentId)
                if (child) return child
            }
            return undefined
        },
        [transformedIntents],
    )

    return {
        intents: transformedIntents,
        findIntent,
        isLoading,
        isError,
        isMetricsLoading,
        isMetricsError,
        metricsDateRange,
    }
}
