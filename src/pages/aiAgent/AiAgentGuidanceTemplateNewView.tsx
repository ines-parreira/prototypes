import React, {useMemo} from 'react'

import {LocaleCode} from 'models/helpCenter/types'

import {GuidanceForm} from './components/GuidanceForm/GuidanceForm'
import {useGuidanceArticleMutation} from './hooks/useGuidanceArticleMutation'
import {GuidanceFormFields, GuidanceTemplate} from './types'
import {mapGuidanceFormFieldsToGuidanceArticle} from './utils/guidance.utils'

type Props = {
    shopName: string
    guidanceTemplate: GuidanceTemplate
    guidanceHelpCenterId: number
    locale: LocaleCode
}

export const AiAgentGuidanceTemplateNewView = ({
    shopName,
    guidanceTemplate,
    guidanceHelpCenterId,
    locale,
}: Props) => {
    const {createGuidanceArticle, isGuidanceArticleUpdating} =
        useGuidanceArticleMutation({
            guidanceHelpCenterId,
        })

    const onSubmit = async (guidanceFormFields: GuidanceFormFields) => {
        await createGuidanceArticle(
            mapGuidanceFormFieldsToGuidanceArticle(
                guidanceFormFields,
                locale,
                `template_guidance_${guidanceTemplate.id}`
            )
        )
    }

    const initialFields = useMemo(
        () => ({
            name: guidanceTemplate.name,
            content: guidanceTemplate.content,
            isVisible: true,
        }),
        [guidanceTemplate]
    )

    return (
        <GuidanceForm
            actionType="create"
            shopName={shopName}
            initialFields={initialFields}
            onSubmit={onSubmit}
            isLoading={isGuidanceArticleUpdating}
            sourceType="template"
            helpCenterId={guidanceHelpCenterId}
        />
    )
}
