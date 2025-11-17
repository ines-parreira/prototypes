import React, { useMemo, useState } from 'react'

import { Redirect } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import type { LocaleCode } from 'models/helpCenter/types'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'

import { GuidanceForm } from './components/GuidanceForm/GuidanceForm'
import { useAiAgentNavigation } from './hooks/useAiAgentNavigation'
import { useGuidanceAiSuggestions } from './hooks/useGuidanceAiSuggestions'
import { useGuidanceArticleMutation } from './hooks/useGuidanceArticleMutation'
import type { GuidanceFormFields } from './types'
import { mapGuidanceFormFieldsToGuidanceArticle } from './utils/guidance.utils'

import css from './AiAgentGuidanceContainer.less'

type Props = {
    shopName: string
    aiGuidanceId: string
    guidanceHelpCenterId: number
    locale: LocaleCode
    shopType: string
}

export const AiAgentGuidanceAiSuggestionNewView = ({
    shopName,
    aiGuidanceId,
    guidanceHelpCenterId,
    locale,
    shopType,
}: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const [onSubmitLoading, setOnSubmitLoading] = useState(false)

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    const {
        guidanceAISuggestions,
        isLoadingAiGuidances,
        invalidateAiGuidances,
    } = useGuidanceAiSuggestions({
        helpCenterId: guidanceHelpCenterId,
        shopName,
    })

    const aiGuidanceSuggestion = useMemo(() => {
        if (!guidanceAISuggestions || !aiGuidanceId) {
            return null
        }
        const aiGuidanceSuggestion = guidanceAISuggestions.find(
            (aiGuidance) => aiGuidance.key === aiGuidanceId,
        )
        return aiGuidanceSuggestion
    }, [aiGuidanceId, guidanceAISuggestions])

    const { createGuidanceArticle, isGuidanceArticleUpdating } =
        useGuidanceArticleMutation({
            guidanceHelpCenterId,
        })

    const onSubmit = async (guidanceFormFields: GuidanceFormFields) => {
        setOnSubmitLoading(true)
        await createGuidanceArticle(
            mapGuidanceFormFieldsToGuidanceArticle(
                guidanceFormFields,
                locale,
                aiGuidanceSuggestion?.key,
            ),
        )
        await invalidateAiGuidances()
        setOnSubmitLoading(false)
    }

    const initialFields = useMemo(() => {
        if (!aiGuidanceSuggestion) return
        return {
            name: aiGuidanceSuggestion.name,
            content: aiGuidanceSuggestion.content,
            isVisible: true,
        }
    }, [aiGuidanceSuggestion])

    if (isLoadingAiGuidances || isLoadingActions) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    if (!aiGuidanceSuggestion) {
        return <Redirect to={routes.guidanceLibrary} />
    }

    return (
        <GuidanceForm
            shopName={shopName}
            actionType="create"
            availableActions={guidanceActions}
            initialFields={initialFields}
            onSubmit={onSubmit}
            isLoading={isGuidanceArticleUpdating || onSubmitLoading}
            sourceType="ai"
            helpCenterId={guidanceHelpCenterId}
        />
    )
}
