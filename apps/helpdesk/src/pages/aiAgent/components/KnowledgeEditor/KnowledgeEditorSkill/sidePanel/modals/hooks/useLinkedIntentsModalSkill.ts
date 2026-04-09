import { useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { useListIntents } from 'models/helpCenter/queries'
import { useSkillEditorStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/context/KnowledgeEditorSkillContext'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useIntentsMetrics } from 'pages/aiAgent/skills/hooks/useIntentsMetrics'
import { HANDOVER_ONLY_INTENTS } from 'pages/aiAgent/skills/hooks/useIntentsTable'
import type { Components } from 'rest_api/help_center_api/client.generated'

import { usePersistLinkedIntentsSkill } from '../../hooks/usePersistLinkedIntentsSkill'

export type SkillIntentItem = Components.Schemas.ArticleTranslationIntentDto

export type SkillIntentGroupItem = Omit<
    Components.Schemas.ArticleTranslationIntentGroupDto,
    'children'
> & {
    children: SkillIntentItem[]
}

const normalizeString = (value: string) => value.trim().toLowerCase()

const createDefaultExpandedGroups = (groups: SkillIntentGroupItem[]) =>
    groups.reduce<Record<string, boolean>>((acc, group, index) => {
        acc[group.name] = index === 0
        return acc
    }, {})

export const useLinkedIntentsModalSkill = (
    isOpen: boolean,
    onClose: () => void,
) => {
    const { shopName } = useParams<{ shopName: string }>()
    const routes = useMemo(
        () => getAiAgentNavigationRoutes(shopName),
        [shopName],
    )

    const { persistLinkedIntents, isUpdating: isSaving } =
        usePersistLinkedIntentsSkill()

    const { helpCenterId, selectedIntentIds } = useSkillEditorStore(
        useShallow((storeState) => ({
            helpCenterId: storeState.config.helpCenter?.id,
            selectedIntentIds: storeState.state.intents,
        })),
    )

    const isHelpCenterReady = helpCenterId !== undefined

    const {
        data: listIntentsData,
        isLoading: isLoadingIntents,
        isError: isIntentsError,
        refetch: onRetryLoadIntents,
    } = useListIntents(helpCenterId ?? 0, {
        enabled: isOpen && isHelpCenterReady,
    })

    const { data: intentsMetricsMap, isLoading: isMetricsLoading } =
        useIntentsMetrics(isOpen && isHelpCenterReady)

    const groups = useMemo<SkillIntentGroupItem[]>(() => {
        if (!listIntentsData?.intents) return []

        const groupMap = new Map<string, SkillIntentItem[]>()

        for (const intent of listIntentsData.intents) {
            const parts = intent.name.split('::')
            if (parts.length !== 2) continue

            const groupName = parts[0]
            const publishedArticle = intent.articles.find(
                (a) => a.status === 'published',
            )

            const item: SkillIntentItem = {
                intent: intent.name,
                name: intent.name,
                is_available: !publishedArticle,
                ...(publishedArticle
                    ? {
                          used_by_article: {
                              id: publishedArticle.id,
                              version:
                                  publishedArticle.article_translation_version_id,
                              title: publishedArticle.title,
                              locale: publishedArticle.locale,
                          },
                      }
                    : {}),
            }

            if (!groupMap.has(groupName)) {
                groupMap.set(groupName, [])
            }
            groupMap.get(groupName)!.push(item)
        }

        return Array.from(groupMap.entries()).map(([name, children]) => ({
            name,
            children,
        }))
    }, [listIntentsData?.intents])

    const [searchValue, setSearchValue] = useState('')
    const [draftIntentIds, setDraftIntentIds] = useState<string[]>(
        () => selectedIntentIds,
    )
    const [expandedGroups, setExpandedGroups] = useState<
        Record<string, boolean>
    >({})

    const intentTicketVolumeById = useMemo(() => {
        if (isMetricsLoading || !intentsMetricsMap) {
            return {} as Record<string, number>
        }

        const result: Record<string, number> = {}
        intentsMetricsMap.forEach((metrics, intentId) => {
            result[intentId] = metrics.ticketVolume
        })
        return result
    }, [intentsMetricsMap, isMetricsLoading])

    const groupsSortedByTicketVolume = useMemo(
        () =>
            groups.map((group) => ({
                ...group,
                children: [...group.children].sort(
                    (leftIntent, rightIntent) => {
                        const leftIsHandover = HANDOVER_ONLY_INTENTS.includes(
                            leftIntent.intent,
                        )
                        const rightIsHandover = HANDOVER_ONLY_INTENTS.includes(
                            rightIntent.intent,
                        )

                        if (leftIsHandover !== rightIsHandover) {
                            return leftIsHandover ? 1 : -1
                        }

                        const leftVolume =
                            intentTicketVolumeById[leftIntent.intent] ?? 0
                        const rightVolume =
                            intentTicketVolumeById[rightIntent.intent] ?? 0
                        const volumeDiff = rightVolume - leftVolume

                        if (volumeDiff !== 0) {
                            return volumeDiff
                        }

                        return leftIntent.intent.localeCompare(
                            rightIntent.intent,
                        )
                    },
                ),
            })),
        [groups, intentTicketVolumeById],
    )

    const defaultExpandedGroups = useMemo(
        () => createDefaultExpandedGroups(groupsSortedByTicketVolume),
        [groupsSortedByTicketVolume],
    )

    const getIsGroupExpanded = (groupName: string) =>
        Boolean(expandedGroups[groupName] ?? defaultExpandedGroups[groupName])

    const allIntents = useMemo<SkillIntentItem[]>(
        () => groupsSortedByTicketVolume.flatMap((group) => group.children),
        [groupsSortedByTicketVolume],
    )

    const filteredGroups = useMemo(() => {
        const trimmedSearchValue = normalizeString(searchValue)
        if (!trimmedSearchValue) {
            return groupsSortedByTicketVolume
        }

        return groupsSortedByTicketVolume
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
    }, [groupsSortedByTicketVolume, searchValue])

    const isSearching = searchValue.trim().length > 0

    const handleModalOpenChange = (nextIsOpen: boolean) => {
        if (!nextIsOpen && !isSaving) {
            onClose()
        }
    }

    const toggleIntent = (intent: SkillIntentItem) => {
        if (
            HANDOVER_ONLY_INTENTS.includes(intent.intent) ||
            selectedIntentIds.includes(intent.intent)
        ) {
            return
        }

        setDraftIntentIds((previousDraftIntentIds) =>
            previousDraftIntentIds.includes(intent.intent)
                ? previousDraftIntentIds.filter((id) => id !== intent.intent)
                : [...previousDraftIntentIds, intent.intent],
        )
    }

    const toggleGroupExpanded = (groupName: string) => {
        setExpandedGroups((previousExpandedGroups) => ({
            ...previousExpandedGroups,
            [groupName]: !previousExpandedGroups[groupName],
        }))
    }

    const hasConflicts = useMemo(() => {
        const newlyAddedIntentIds = draftIntentIds.filter(
            (id) => !selectedIntentIds.includes(id),
        )
        return newlyAddedIntentIds.some((intentId) => {
            const intent = allIntents.find((i) => i.intent === intentId)
            return !!intent?.used_by_article
        })
    }, [draftIntentIds, selectedIntentIds, allIntents])

    const saveIntents = () => {
        void persistLinkedIntents(draftIntentIds, () => onClose())
    }

    const hasChanges =
        draftIntentIds.length !== selectedIntentIds.length ||
        draftIntentIds.some((id) => !selectedIntentIds.includes(id))

    return {
        searchValue,
        setSearchValue,
        draftIntentIds,
        initialIntentIds: selectedIntentIds,
        allIntents,
        filteredGroups,
        intentTicketVolumeById,
        isSearching,
        isLoadingIntents,
        isIntentsError,
        isSaving,
        hasChanges,
        toggleIntent,
        toggleGroupExpanded,
        getIsGroupExpanded,
        onRetryLoadIntents,
        hasConflicts,
        saveIntents,
        handleModalOpenChange,
        skillEditRoute: routes.skillDetail,
    }
}
