import React, {useMemo, useState} from 'react'
import {Redirect} from 'react-router-dom'

import {LocaleCode} from 'models/helpCenter/types'
import Spinner from 'pages/common/components/Spinner'

import css from './AiAgentGuidanceContainer.less'
import {GuidanceForm} from './components/GuidanceForm/GuidanceForm'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {useGuidanceAiSuggestions} from './hooks/useGuidanceAiSuggestions'
import {useGuidanceArticleMutation} from './hooks/useGuidanceArticleMutation'
import {GuidanceFormFields} from './types'
import {mapGuidanceFormFieldsToGuidanceArticle} from './utils/guidance.utils'

type Props = {
    shopName: string
    aiGuidanceId: string
    guidanceHelpCenterId: number
    locale: LocaleCode
}

export const AiAgentGuidanceAiSuggestionNewView = ({
    shopName,
    aiGuidanceId,
    guidanceHelpCenterId,
    locale,
}: Props) => {
    const {routes} = useAiAgentNavigation({shopName})
    const [onSubmitLoading, setOnSubmitLoading] = useState(false)

    const {guidanceAISuggestions, isLoadingAiGuidances, invalidateAiGuidances} =
        useGuidanceAiSuggestions({
            helpCenterId: guidanceHelpCenterId,
            shopName,
        })

    const aiGuidanceSuggestion = useMemo(() => {
        if (!guidanceAISuggestions || !aiGuidanceId) {
            return null
        }
        const aiGuidanceSuggestion = guidanceAISuggestions.find(
            (aiGuidance) => aiGuidance.key === aiGuidanceId
        )
        return aiGuidanceSuggestion
    }, [aiGuidanceId, guidanceAISuggestions])

    const {createGuidanceArticle, isGuidanceArticleUpdating} =
        useGuidanceArticleMutation({
            guidanceHelpCenterId,
        })

    const onSubmit = async (guidanceFormFields: GuidanceFormFields) => {
        setOnSubmitLoading(true)
        await createGuidanceArticle(
            mapGuidanceFormFieldsToGuidanceArticle(
                guidanceFormFields,
                locale,
                aiGuidanceSuggestion?.key
            )
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

    if (isLoadingAiGuidances) {
        return (
            <div className={css.spinner}>
                <Spinner size="big" />
            </div>
        )
    }

    if (!aiGuidanceSuggestion) {
        return <Redirect to={routes.guidanceLibrary} />
    }

    return (
        <GuidanceForm
            actionType="create"
            shopName={shopName}
            initialFields={initialFields}
            onSubmit={onSubmit}
            isLoading={isGuidanceArticleUpdating || onSubmitLoading}
            sourceType="ai"
        />
    )
}
