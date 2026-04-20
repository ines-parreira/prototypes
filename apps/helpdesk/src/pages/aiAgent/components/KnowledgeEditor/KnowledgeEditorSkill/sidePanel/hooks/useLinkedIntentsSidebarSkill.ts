import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { formatIntentName } from 'pages/aiAgent/skills/utils'

import { useSkillEditorStore } from '../../context/KnowledgeEditorSkillContext'
import { useSkillIntentConflicts } from '../../hooks/useSkillIntentConflicts'
import { useIntentLinkButton } from './useIntentLinkButton'

const EMPTY_INTENT_IDS: string[] = []

type TagColor = 'green' | 'red' | 'purple'

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

    const unchangedAndRemoved = oldIntents.map((intentId) => ({
        intentId,
        label: formatIntentName(intentId),
        color: nextIntentSet.has(intentId) ? undefined : ('red' as TagColor),
        showLeadingDot: false,
        tooltip: undefined,
    }))

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

function buildPlainItems(intentIds: string[]): IntentItem[] {
    return intentIds.map((intentId) => ({
        intentId,
        label: formatIntentName(intentId),
        color: undefined,
        showLeadingDot: false,
        tooltip: undefined,
    }))
}

export const useLinkedIntentsSidebarSkill = () => {
    const {
        mode,
        intentIds,
        historicalVersionIntentIds,
        comparisonVersionIntentIds,
        publishedVersionId,
        isCurrent,
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
            isCurrent: storeState.state.skill?.isCurrent,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
        })),
    )

    const linkButton = useIntentLinkButton()
    const { conflictingIntentIds } = useSkillIntentConflicts()

    const isViewingHistoricalVersion = historicalPublishedDatetime != null
    const isDiffMode = mode === 'diff'
    const hasPublishedVersion = publishedVersionId != null
    const isViewingDraft = isCurrent === false

    const displayedIntentIds = isViewingHistoricalVersion
        ? historicalVersionIntentIds
        : intentIds

    const publishedIntentIdsSet = useMemo(
        () => new Set(comparisonVersionIntentIds),
        [comparisonVersionIntentIds],
    )

    const items = useMemo<IntentItem[]>(() => {
        // Diff mode: red (removed), green (added), empty (unchanged)
        if (isDiffMode) {
            const oldIntents = isViewingHistoricalVersion
                ? historicalVersionIntentIds
                : comparisonVersionIntentIds
            const newIntents = isViewingHistoricalVersion
                ? comparisonVersionIntentIds
                : intentIds
            return buildDiffItems(oldIntents, newIntents)
        }

        // Version history: empty background
        if (isViewingHistoricalVersion) {
            return buildPlainItems(displayedIntentIds)
        }

        // Normal view: conflict / purple (new in draft) / empty
        return displayedIntentIds.map((intentId) => {
            // Conflict: intent linked to another published+enabled skill
            if (conflictingIntentIds.has(intentId)) {
                return {
                    intentId,
                    label: formatIntentName(intentId),
                    color: undefined,
                    showLeadingDot: true,
                    tooltip: 'Intent already linked to an existing skill',
                }
            }

            // Added on top of published: exists in draft but not in published
            if (
                isViewingDraft &&
                hasPublishedVersion &&
                !publishedIntentIdsSet.has(intentId)
            ) {
                return {
                    intentId,
                    label: formatIntentName(intentId),
                    color: 'purple' as TagColor,
                    showLeadingDot: false,
                    tooltip:
                        'Intent not yet linked to skill. Publish your changes to link.',
                }
            }

            // Available: empty background
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
        isViewingDraft,
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
