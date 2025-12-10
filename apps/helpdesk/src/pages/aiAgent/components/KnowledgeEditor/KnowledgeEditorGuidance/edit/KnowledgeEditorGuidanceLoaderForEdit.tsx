import { useCallback } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import { useResourceMetrics } from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'
import type { LocaleCode } from 'models/helpCenter/types'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import type { GuidanceFormFields } from 'pages/aiAgent/types'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'
import { getTimezone } from 'state/currentUser/selectors'

import type { BaseProps } from '../KnowledgeEditorGuidanceView'
import { KnowledgeEditorGuidanceStatefulEdit } from './KnowledgeEditorGuidanceStatefulEdit'

type Props = BaseProps & {
    shopType: string
    guidanceArticleId: number
    guidanceHelpCenterId: number
    locale: LocaleCode
    onDeleteFn?: () => void
    onUpdateFn?: () => void
    onCopyFn?: () => void
    closeHandlerRef: React.MutableRefObject<(() => void) | null>
}

export const KnowledgeEditorGuidanceLoaderForEdit = ({
    shopName,
    shopType,
    guidanceArticleId,
    guidanceHelpCenterId,
    locale,
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
    onDeleteFn,
    onUpdateFn,
    onCopyFn,
    isFullscreen,
    onToggleFullscreen,
    onTest,
    closeHandlerRef,
}: Props) => {
    const { error: notifyError } = useNotify()
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )
    const timezone = useAppSelector(getTimezone)

    const { guidanceArticle, isGuidanceArticleLoading } = useGuidanceArticle({
        guidanceHelpCenterId,
        guidanceArticleId,
        locale,
        versionStatus: 'current',
    })

    // Fetch article metrics for the Impact section
    const resourceImpact = useResourceMetrics({
        resourceSourceId: guidanceArticleId,
        resourceSourceSetId: guidanceHelpCenterId,
        timezone: timezone ?? 'UTC',
        enabled: isPerformanceStatsEnabled,
    })

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    const {
        updateGuidanceArticle,
        deleteGuidanceArticle,
        duplicateGuidanceArticle,
        isGuidanceArticleUpdating,
    } = useGuidanceArticleMutation({
        guidanceHelpCenterId,
    })

    const onSave = useCallback(
        async (guidanceFormFields: GuidanceFormFields) => {
            try {
                const response = await updateGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        guidanceFormFields,
                        locale,
                    ),
                    { articleId: guidanceArticleId, locale },
                )
                onUpdateFn?.()
                return response
            } catch {
                notifyError('An error occurred while editing guidance.')
            }
        },
        [
            updateGuidanceArticle,
            guidanceArticleId,
            locale,
            onUpdateFn,
            notifyError,
        ],
    )

    const onDelete = useCallback(async () => {
        try {
            await deleteGuidanceArticle(guidanceArticleId)
            onDeleteFn?.()
        } catch {
            notifyError('An error occurred while deleting guidance.')
        }
    }, [deleteGuidanceArticle, guidanceArticleId, onDeleteFn, notifyError])

    const onDuplicate = useCallback(async () => {
        try {
            await duplicateGuidanceArticle(guidanceArticleId, shopName)
            onCopyFn?.()
        } catch {
            notifyError('An error occurred while duplicating guidance.')
        }
    }, [
        duplicateGuidanceArticle,
        guidanceArticleId,
        shopName,
        onCopyFn,
        notifyError,
    ])

    if (!guidanceArticle || isGuidanceArticleLoading || isLoadingActions) {
        return <LoadingSpinner size="big" />
    }

    return (
        <KnowledgeEditorGuidanceStatefulEdit
            key={guidanceArticle.id}
            shopName={shopName}
            availableActions={guidanceActions}
            guidanceArticle={guidanceArticle}
            onSave={onSave}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            isGuidanceArticleUpdating={isGuidanceArticleUpdating}
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            guidanceMode={guidanceMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            onTest={onTest}
            closeHandlerRef={closeHandlerRef}
            impact={
                isPerformanceStatsEnabled
                    ? {
                          tickets: resourceImpact.data?.tickets,
                          handoverTickets: resourceImpact.data?.handoverTickets,
                          csat: resourceImpact.data?.csat,
                          intents: resourceImpact.data?.intents,
                          isLoading: resourceImpact.isLoading,
                      }
                    : undefined
            }
        />
    )
}
