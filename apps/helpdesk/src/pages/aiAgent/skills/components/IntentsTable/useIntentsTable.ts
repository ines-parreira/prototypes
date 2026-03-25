import { useMemo } from 'react'

import { useListIntents } from 'models/helpCenter/queries'

import type { ArticleInIntentDto, IntentResponseDto } from '../../types'
import { IntentStatus } from '../../types'
import { formatIntentName } from '../../utils'
import { INTENT_DESCRIPTIONS } from './intentDescriptions'

export interface IntentMetrics {
    tickets: number | null
    handoverTickets: number | null
    resourceSourceSetId: number
}

export type ToggleState = 'enabled' | 'disabled' | 'indeterminate'

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

    const enabledCount = children.filter(
        (child) => child.toggleState === 'enabled',
    ).length

    if (enabledCount === children.length) return 'enabled'
    if (enabledCount === 0) return 'disabled'
    return 'indeterminate'
}

export const useIntentsTable = (helpCenterId: number) => {
    const { data, isLoading, isError } = useListIntents(helpCenterId, {
        enabled: !!helpCenterId,
    })

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

            const isHandoverOnlyIntent =
                intent.name === 'other::no reply' ||
                intent.name === 'other::spam'

            const toggleState: ToggleState = isHandoverOnlyIntent
                ? 'disabled'
                : intent.status === IntentStatus.Linked ||
                    intent.status === IntentStatus.NotLinked
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
        })

        return Array.from(l1ParentsMap.values())
    }, [data])

    return {
        intents: transformedIntents,
        isLoading,
        isError,
    }
}
