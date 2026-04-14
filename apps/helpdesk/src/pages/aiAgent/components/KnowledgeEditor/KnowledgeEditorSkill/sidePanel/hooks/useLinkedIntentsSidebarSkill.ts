import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { formatIntentName } from 'pages/aiAgent/skills/utils'

import { useSkillEditorStore } from '../../context/KnowledgeEditorSkillContext'
import { useIntentConflicts } from './useIntentConflicts'
import { useIntentLinkButton } from './useIntentLinkButton'

const EMPTY_INTENT_IDS: string[] = []

type TagColor = 'green' | 'red' | 'grey' | 'purple'

export type IntentItem = {
    intentId: string
    label: string
    color?: TagColor
    showLeadingDot: boolean
    tooltip?: string
}

function buildDiffItems(
    oldIntents: string[],
    newIntents: string[],
): IntentItem[] {
    const nextIntentSet = new Set(newIntents)
    const previousIntentSet = new Set(oldIntents)

    const unchangedAndRemoved = oldIntents.map((intentId) => {
        const isRemoved = !nextIntentSet.has(intentId)
        return {
            intentId,
            label: formatIntentName(intentId),
            color: isRemoved ? ('red' as TagColor) : undefined,
            showLeadingDot: false,
            tooltip: undefined,
        }
    })

    const added = newIntents
        .filter((intentId) => !previousIntentSet.has(intentId))
        .map((intentId) => ({
            intentId,
            label: formatIntentName(intentId),
            color: 'green' as TagColor,
            showLeadingDot: false,
            tooltip: undefined,
        }))

    return [...unchangedAndRemoved, ...added]
}

export const useLinkedIntentsSidebarSkill = () => {
    const {
        mode,
        intentIds,
        historicalVersionIntentIds,
        comparisonVersionIntentIds,
        publishedVersionId,
        draftVersionId,
        isFromTemplate,
        historicalPublishedDatetime,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            mode: storeState.state.mode,
            intentIds: storeState.state.intents,
            historicalVersionIntentIds:
                storeState.state.historicalVersion?.intents ?? EMPTY_INTENT_IDS,
            comparisonVersionIntentIds:
                storeState.state.comparisonVersion?.intents ?? EMPTY_INTENT_IDS,
            publishedVersionId: storeState.state.skill?.publishedVersionId,
            draftVersionId: storeState.state.skill?.draftVersionId,
            isFromTemplate: storeState.state.isFromTemplate,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
        })),
    )

    const linkButton = useIntentLinkButton()
    const conflictingIntentIds = useIntentConflicts()

    const isViewingHistoricalVersion = historicalPublishedDatetime != null
    const isDiffMode = mode === 'diff'
    const hasDraft =
        draftVersionId != null &&
        publishedVersionId != null &&
        draftVersionId !== publishedVersionId
    const hasPublishedVersion = publishedVersionId != null

    const displayedIntentIds = isViewingHistoricalVersion
        ? historicalVersionIntentIds
        : intentIds

    const publishedIntentIdsSet = useMemo<Set<string>>(() => {
        if (!hasDraft) {
            if (hasPublishedVersion) {
                return new Set(displayedIntentIds)
            }
            return new Set()
        }
        return new Set(comparisonVersionIntentIds)
    }, [
        hasDraft,
        hasPublishedVersion,
        displayedIntentIds,
        comparisonVersionIntentIds,
    ])

    const items = useMemo<IntentItem[]>(() => {
        if (isDiffMode) {
            const oldIntents = isViewingHistoricalVersion
                ? historicalVersionIntentIds
                : comparisonVersionIntentIds
            const newIntents = isViewingHistoricalVersion
                ? comparisonVersionIntentIds
                : intentIds
            return buildDiffItems(oldIntents, newIntents)
        }

        if (isViewingHistoricalVersion) {
            return displayedIntentIds.map((intentId) => ({
                intentId,
                label: formatIntentName(intentId),
                color: undefined,
                showLeadingDot: false,
                tooltip: undefined,
            }))
        }

        return displayedIntentIds.map((intentId) => {
            const isConflict = conflictingIntentIds.has(intentId)
            if (isConflict) {
                return {
                    intentId,
                    label: formatIntentName(intentId),
                    color: undefined,
                    showLeadingDot: true,
                    tooltip: 'Intent already linked to an existing skill',
                }
            }

            const isNewInDraft =
                !publishedIntentIdsSet.has(intentId) &&
                !isFromTemplate &&
                hasPublishedVersion
            if (isNewInDraft) {
                return {
                    intentId,
                    label: formatIntentName(intentId),
                    color: 'purple' as TagColor,
                    showLeadingDot: false,
                    tooltip:
                        'Intent not yet linked to skill. Publish your changes to link.',
                }
            }

            return {
                intentId,
                label: formatIntentName(intentId),
                color: undefined,
                showLeadingDot: false,
                tooltip: undefined,
            }
        })
    }, [
        isDiffMode,
        isViewingHistoricalVersion,
        historicalVersionIntentIds,
        comparisonVersionIntentIds,
        intentIds,
        displayedIntentIds,
        conflictingIntentIds,
        publishedIntentIdsSet,
        isFromTemplate,
        hasPublishedVersion,
    ])

    const showBanner = !isDiffMode && items.some((item) => item.showLeadingDot)

    return {
        items,
        showBanner,
        showLinkButton: !isDiffMode,
        linkButton,
        intentsCount: displayedIntentIds.length,
    }
}
