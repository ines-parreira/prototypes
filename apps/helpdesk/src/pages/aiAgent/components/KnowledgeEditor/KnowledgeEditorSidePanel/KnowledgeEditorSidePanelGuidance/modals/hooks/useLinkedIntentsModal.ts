import { useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import {
    getLast28DaysDateRange,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { useGetArticleTranslationIntents } from 'models/helpCenter/queries'
import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { getTimezone } from 'state/currentUser/selectors'

import { usePersistLinkedIntents } from '../../hooks/usePersistLinkedIntents'
import type {
    ApiIntent,
    LinkedIntent,
    LinkedIntentGroup,
} from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal'

const EMPTY_INTENT_IDS: string[] = []

const createDefaultExpandedGroups = (groups: LinkedIntentGroup[]) =>
    groups.reduce<Record<string, boolean>>((acc, group, index) => {
        acc[group.name] = index === 0
        return acc
    }, {})

const normalizeString = (value: string) => value.trim().toLowerCase()
const getTicketCountForIntent = (
    intentId: string,
    intentTicketCountById: Record<string, number>,
) => intentTicketCountById[intentId] ?? 0
const sortIntentsByTicketCountDesc = (
    leftIntent: ApiIntent,
    rightIntent: ApiIntent,
    intentTicketCountById: Record<string, number>,
) => {
    const leftIntentIsDisabled = !leftIntent.is_available
    const rightIntentIsDisabled = !rightIntent.is_available

    if (leftIntentIsDisabled !== rightIntentIsDisabled) {
        return leftIntentIsDisabled ? 1 : -1
    }

    const ticketCountDifference =
        getTicketCountForIntent(rightIntent.intent, intentTicketCountById) -
        getTicketCountForIntent(leftIntent.intent, intentTicketCountById)

    if (ticketCountDifference !== 0) {
        return ticketCountDifference
    }

    return leftIntent.intent.localeCompare(rightIntent.intent)
}

export const useLinkedIntentsModal = (isOpen: boolean, onClose: () => void) => {
    const { shopName } = useParams<{ shopName: string }>()
    const routes = useMemo(
        () => getAiAgentNavigationRoutes(shopName),
        [shopName],
    )

    const { persistLinkedIntents, isUpdating: isSaving } =
        usePersistLinkedIntents()

    const {
        guidanceArticleId,
        guidanceArticleLocale,
        guidanceHelpCenterId,
        guidanceShopIntegrationId,
        selectedIntentIds,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceArticleId:
                storeState.state.guidance?.id ?? storeState.guidanceArticle?.id,
            guidanceArticleLocale:
                storeState.state.guidance?.locale ??
                storeState.guidanceArticle?.locale,
            guidanceHelpCenterId: storeState.config.guidanceHelpCenter?.id,
            guidanceShopIntegrationId:
                storeState.config.guidanceHelpCenter?.shop_integration_id ?? 0,
            selectedIntentIds:
                storeState.state.guidance?.intents ?? EMPTY_INTENT_IDS,
        })),
    )
    const timezone = useAppSelector(getTimezone)

    const areIntentPathParamsReady =
        guidanceHelpCenterId !== undefined &&
        guidanceArticleId !== undefined &&
        guidanceArticleLocale !== undefined
    const dateRange = useMemo(() => getLast28DaysDateRange(), [])

    const {
        data: articleTranslationIntents,
        isLoading: isLoadingIntents,
        isError: isIntentsError,
        refetch: onRetryLoadIntents,
    } = useGetArticleTranslationIntents(
        {
            help_center_id: guidanceHelpCenterId ?? 0,
            article_id: guidanceArticleId ?? 0,
            locale: guidanceArticleLocale ?? '',
        },
        {
            enabled: isOpen && areIntentPathParamsReady,
        },
    )

    const intentGroups = articleTranslationIntents?.intents
    const groups = useMemo(() => intentGroups ?? [], [intentGroups])

    const intentMetrics = useResourceMetrics({
        resourceSourceId: guidanceArticleId ?? 0,
        resourceSourceSetId: guidanceHelpCenterId ?? 0,
        shopIntegrationId: guidanceShopIntegrationId,
        timezone: timezone ?? 'UTC',
        enabled: isOpen && areIntentPathParamsReady,
        dateRange,
    })

    const [searchValue, setSearchValue] = useState('')
    const [draftIntentIds, setDraftIntentIds] = useState<string[]>(
        () => selectedIntentIds,
    )
    const [expandedGroups, setExpandedGroups] = useState<
        Record<string, boolean>
    >({})

    const intentTicketCountById = useMemo(
        () =>
            (intentMetrics.data?.intents ?? []).reduce<Record<string, number>>(
                (acc, intentMetric) => {
                    const previousCount = acc[intentMetric.intent] ?? 0
                    acc[intentMetric.intent.toLowerCase()] = Math.max(
                        previousCount,
                        intentMetric.ticketCount,
                    )
                    return acc
                },
                {},
            ),
        [intentMetrics.data?.intents],
    )

    const groupsSortedByTicketCount = useMemo(
        () =>
            groups.map((group) => ({
                ...group,
                children: [...group.children].sort((leftIntent, rightIntent) =>
                    sortIntentsByTicketCountDesc(
                        leftIntent,
                        rightIntent,
                        intentTicketCountById,
                    ),
                ),
            })),
        [groups, intentTicketCountById],
    )

    const defaultExpandedGroups = useMemo(
        () => createDefaultExpandedGroups(groupsSortedByTicketCount),
        [groupsSortedByTicketCount],
    )

    const getIsGroupExpanded = (groupName: string) =>
        Boolean(expandedGroups[groupName] ?? defaultExpandedGroups[groupName])

    const allIntents = useMemo<LinkedIntent[]>(
        () => groupsSortedByTicketCount.flatMap((group) => group.children),
        [groupsSortedByTicketCount],
    )

    const intentsById = useMemo(
        () =>
            allIntents.reduce<Record<string, LinkedIntent>>((acc, intent) => {
                acc[intent.intent] = intent
                return acc
            }, {}),
        [allIntents],
    )

    const filteredGroups = useMemo(() => {
        const trimmedSearchValue = normalizeString(searchValue)
        if (!trimmedSearchValue) {
            return groupsSortedByTicketCount
        }

        return groupsSortedByTicketCount
            .map((group) => ({
                ...group,
                children: group.children.filter((intent) => {
                    const normalizedIntentName = normalizeString(intent.name)
                    const normalizedIntentKey = normalizeString(intent.intent)
                    return (
                        normalizedIntentName.includes(trimmedSearchValue) ||
                        normalizedIntentKey.includes(trimmedSearchValue)
                    )
                }),
            }))
            .filter((group) => group.children.length > 0)
    }, [groupsSortedByTicketCount, searchValue])

    const suggestedIntents = useMemo(() => {
        if (searchValue.trim().length > 0) {
            return []
        }

        return allIntents
            .filter((intent) => intent.is_available)
            .sort((leftIntent, rightIntent) =>
                sortIntentsByTicketCountDesc(
                    leftIntent,
                    rightIntent,
                    intentTicketCountById,
                ),
            )
            .slice(0, 2)
    }, [allIntents, intentTicketCountById, searchValue])

    const isSearching = searchValue.trim().length > 0

    const handleModalOpenChange = (nextIsOpen: boolean) => {
        if (!nextIsOpen && !isSaving) {
            onClose()
        }
    }

    const toggleIntent = (intent: ApiIntent) => {
        if (!intent.is_available) {
            return
        }

        setDraftIntentIds((previousDraftIntentIds) =>
            previousDraftIntentIds.includes(intent.intent)
                ? previousDraftIntentIds.filter((id) => id !== intent.intent)
                : [...previousDraftIntentIds, intent.intent],
        )
    }

    const toggleGroupIntents = (group: LinkedIntentGroup) => {
        const availableIntentIds: string[] = group.children
            .filter((intent) => intent.is_available)
            .map((intent) => intent.intent)

        if (availableIntentIds.length === 0) {
            return
        }

        const areAllAvailableIntentsSelected = availableIntentIds.every((id) =>
            draftIntentIds.includes(id),
        )

        setDraftIntentIds((previousDraftIntentIds) => {
            if (areAllAvailableIntentsSelected) {
                return previousDraftIntentIds.filter(
                    (id) => !availableIntentIds.includes(id),
                )
            }

            return Array.from(
                new Set([...previousDraftIntentIds, ...availableIntentIds]),
            )
        })
    }

    const toggleGroupExpanded = (groupName: string) => {
        setExpandedGroups((previousExpandedGroups) => ({
            ...previousExpandedGroups,
            [groupName]: !previousExpandedGroups[groupName],
        }))
    }

    const handleSave = () => {
        const selectedIntents = draftIntentIds
            .map((intentId) => intentsById[intentId])
            .filter((intent): intent is LinkedIntent => intent !== undefined)

        void persistLinkedIntents(
            selectedIntents.map(({ intent }) => intent),
            () => onClose(),
        )
    }

    return {
        searchValue,
        setSearchValue,
        draftIntentIds,
        allIntents,
        filteredGroups,
        suggestedIntents,
        intentTicketCountById,
        isSearching,
        isLoadingIntents,
        isIntentsError,
        isSaving,
        toggleIntent,
        toggleGroupIntents,
        toggleGroupExpanded,
        getIsGroupExpanded,
        onRetryLoadIntents,
        handleSave,
        handleModalOpenChange,
        guidanceEditRoute: routes.guidanceArticleEdit,
    }
}
