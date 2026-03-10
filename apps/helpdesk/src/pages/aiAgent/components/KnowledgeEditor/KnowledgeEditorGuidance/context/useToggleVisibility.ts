import { useCallback, useState } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useNotify } from 'hooks/useNotify'
import { isGorgiasApiError } from 'models/api/types'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { useGuidanceStore } from './KnowledgeEditorGuidanceContext'
import { useGuidanceLimit } from './useGuidanceLimit'

type IntentConflictDetail = {
    intent: string
    articleId: number
    articleTranslationId: number
    title: string
}

type ConflictingGuidance = {
    articleId: number
    title: string
    conflictingIntents: string[]
}

type VisibilityConflictState = {
    isOpen: boolean
    message: string
    conflictingIntents: string[]
    conflictingGuidances: ConflictingGuidance[]
}

type VisibilityConflictResponseData = {
    error?: {
        msg?: unknown
        conflicts?: unknown
    }
    message?: unknown
    conflicts?: unknown
}

const EMPTY_VISIBILITY_CONFLICT_STATE: VisibilityConflictState = {
    isOpen: false,
    message: '',
    conflictingIntents: [],
    conflictingGuidances: [],
}

const INTENT_IDENTIFIER_REGEX = /\b[a-z][a-z &]*::[a-z][a-z ]*\b/gi

const formatIntentForDisplay = (intent: string) => {
    const [group, name] = intent.split('::')
    if (!group || !name) return intent
    return `${group.charAt(0).toUpperCase()}${group.slice(1)}/${name}`
}

const formatVisibilityConflictMessage = (message: string) =>
    message.replace(INTENT_IDENTIFIER_REGEX, (intent) =>
        formatIntentForDisplay(intent),
    )

const isIntentConflictDetail = (
    value: unknown,
): value is IntentConflictDetail => {
    if (!value || typeof value !== 'object') return false

    const conflict = value as Partial<IntentConflictDetail>
    return (
        typeof conflict.intent === 'string' &&
        typeof conflict.articleId === 'number' &&
        typeof conflict.articleTranslationId === 'number' &&
        typeof conflict.title === 'string'
    )
}

const extractConflictingGuidances = (
    conflicts: unknown,
    currentGuidanceId: number,
): ConflictingGuidance[] => {
    if (!Array.isArray(conflicts)) return []

    const validConflicts = conflicts.filter(isIntentConflictDetail)
    const groupedConflicts = new Map<number, ConflictingGuidance>()

    for (const conflict of validConflicts) {
        if (conflict.articleId === currentGuidanceId) continue

        const existingConflict = groupedConflicts.get(conflict.articleId)
        if (existingConflict) {
            if (
                !existingConflict.conflictingIntents.includes(conflict.intent)
            ) {
                existingConflict.conflictingIntents.push(conflict.intent)
            }
            continue
        }

        groupedConflicts.set(conflict.articleId, {
            articleId: conflict.articleId,
            title: conflict.title,
            conflictingIntents: [conflict.intent],
        })
    }

    return [...groupedConflicts.values()]
}

const shouldFallbackToPublishOverride = (error: unknown): boolean => {
    if (!isGorgiasApiError(error)) return false

    const errorMessage = error.response?.data?.error?.msg
    return (
        typeof errorMessage === 'string' &&
        errorMessage.toLowerCase().includes('cannot rebase draft')
    )
}

const extractVisibilityConflictPayload = (error: unknown) => {
    if (!isGorgiasApiError(error)) {
        return {
            message: '',
            conflicts: undefined as unknown,
        }
    }

    const responseData = error.response?.data as
        | VisibilityConflictResponseData
        | undefined
    const message =
        typeof responseData?.error?.msg === 'string'
            ? responseData.error.msg
            : typeof responseData?.message === 'string'
              ? responseData.message
              : ''

    const conflicts = Array.isArray(responseData?.conflicts)
        ? responseData.conflicts
        : responseData?.error?.conflicts

    return {
        message,
        conflicts,
    }
}

export const useToggleVisibility = () => {
    const { error: notifyError } = useNotify()
    const [visibilityConflict, setVisibilityConflict] =
        useState<VisibilityConflictState>(EMPTY_VISIBILITY_CONFLICT_STATE)

    const dispatch = useGuidanceStore((storeState) => storeState.dispatch)
    const {
        guidanceId,
        visibility,
        onUpdateFn,
        guidanceHelpCenterId,
        guidanceHelpCenterLocale,
        guidanceArticles,
        handleVisibilityUpdate,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceId: storeState.state.guidance?.id,
            visibility: storeState.state.visibility,
            onUpdateFn: storeState.config.onUpdateFn,
            guidanceHelpCenterId: storeState.config.guidanceHelpCenter.id ?? 0,
            guidanceHelpCenterLocale:
                storeState.config.guidanceHelpCenter.default_locale,
            guidanceArticles: storeState.config.guidanceArticles,
            handleVisibilityUpdate: storeState.config.handleVisibilityUpdate,
        })),
    )

    const {
        updateGuidanceArticle,
        rebasePublishGuidanceArticle,
        getGuidanceArticleTranslation,
    } = useGuidanceArticleMutation({
        guidanceHelpCenterId,
    })

    const { isAtLimit, limitMessage } = useGuidanceLimit(guidanceArticles)

    const applyVisibilityUpdate = useCallback(
        async (newVisibility: VisibilityStatusEnum) => {
            if (!guidanceId || !guidanceHelpCenterLocale) return false

            const response = await updateGuidanceArticle(
                {
                    visibility: newVisibility,
                    isCurrent: false,
                },
                {
                    articleId: guidanceId,
                    locale: guidanceHelpCenterLocale,
                },
            )

            if (!response) return false

            dispatch({
                type: 'SET_VISIBILITY',
                payload: newVisibility === VisibilityStatusEnum.PUBLIC,
            })
            onUpdateFn?.()
            handleVisibilityUpdate?.(newVisibility)

            return true
        },
        [
            guidanceId,
            guidanceHelpCenterLocale,
            updateGuidanceArticle,
            dispatch,
            onUpdateFn,
            handleVisibilityUpdate,
        ],
    )

    const toggleVisibility = useCallback(async () => {
        if (!guidanceId || !guidanceHelpCenterLocale) return

        const newVisibility: VisibilityStatusEnum = visibility
            ? VisibilityStatusEnum.UNLISTED
            : VisibilityStatusEnum.PUBLIC

        // Prevent enabling if at limit
        if (newVisibility === VisibilityStatusEnum.PUBLIC && isAtLimit) {
            notifyError(limitMessage)
            return
        }

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            await applyVisibilityUpdate(newVisibility)
            setVisibilityConflict(EMPTY_VISIBILITY_CONFLICT_STATE)
        } catch (error) {
            if (
                newVisibility === VisibilityStatusEnum.PUBLIC &&
                isGorgiasApiError(error) &&
                error.response.status === 409
            ) {
                const { message: conflictMessage, conflicts } =
                    extractVisibilityConflictPayload(error)
                const hasStructuredConflicts =
                    Array.isArray(conflicts) && conflicts.length > 0

                if (!hasStructuredConflicts) {
                    notifyError('An error occurred while updating visibility.')
                    return
                }

                const conflictingGuidances = extractConflictingGuidances(
                    conflicts,
                    guidanceId,
                )
                const conflictingIntents = [
                    ...new Set(
                        conflictingGuidances.flatMap(
                            (conflict) => conflict.conflictingIntents,
                        ),
                    ),
                ]

                if (conflictingGuidances.length === 0) {
                    notifyError('An error occurred while updating visibility.')
                    return
                }

                setVisibilityConflict({
                    isOpen: true,
                    message: formatVisibilityConflictMessage(conflictMessage),
                    conflictingIntents,
                    conflictingGuidances,
                })
                return
            }

            notifyError('An error occurred while updating visibility.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
        }
    }, [
        guidanceId,
        dispatch,
        guidanceHelpCenterLocale,
        applyVisibilityUpdate,
        isAtLimit,
        limitMessage,
        notifyError,
        visibility,
    ])

    const closeVisibilityConflictModal = useCallback(() => {
        setVisibilityConflict(EMPTY_VISIBILITY_CONFLICT_STATE)
    }, [])

    const rebaseAndEnableVisibility = useCallback(async () => {
        if (!guidanceId || !guidanceHelpCenterLocale) return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            for (const conflictingGuidance of visibilityConflict.conflictingGuidances) {
                const conflictingTranslation =
                    await getGuidanceArticleTranslation({
                        articleId: conflictingGuidance.articleId,
                        locale: guidanceHelpCenterLocale,
                    })

                if (!conflictingTranslation) continue

                const intentsToKeep = conflictingTranslation.intents.filter(
                    (intent) =>
                        !conflictingGuidance.conflictingIntents.includes(
                            intent,
                        ),
                )

                try {
                    await rebasePublishGuidanceArticle(
                        {
                            intents: intentsToKeep,
                        },
                        {
                            articleId: conflictingGuidance.articleId,
                            locale: conflictingTranslation.locale,
                        },
                    )
                } catch (error) {
                    if (!shouldFallbackToPublishOverride(error)) {
                        throw error
                    }

                    await updateGuidanceArticle(
                        {
                            intents: intentsToKeep,
                            isCurrent: true,
                        },
                        {
                            articleId: conflictingGuidance.articleId,
                            locale: conflictingTranslation.locale,
                        },
                    )
                }
            }

            const isVisibilityUpdated = await applyVisibilityUpdate(
                VisibilityStatusEnum.PUBLIC,
            )
            if (isVisibilityUpdated) {
                setVisibilityConflict(EMPTY_VISIBILITY_CONFLICT_STATE)
            }
        } catch {
            notifyError('An error occurred while rebasing guidance visibility.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
        }
    }, [
        guidanceId,
        guidanceHelpCenterLocale,
        dispatch,
        visibilityConflict.conflictingGuidances,
        rebasePublishGuidanceArticle,
        getGuidanceArticleTranslation,
        updateGuidanceArticle,
        applyVisibilityUpdate,
        notifyError,
    ])

    return {
        toggleVisibility,
        visibilityConflict,
        closeVisibilityConflictModal,
        rebaseAndEnableVisibility,
        isAtLimit,
        limitMessage,
    }
}
