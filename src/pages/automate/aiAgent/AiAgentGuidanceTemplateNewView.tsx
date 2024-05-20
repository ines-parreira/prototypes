import React from 'react'
import {LocaleCode} from 'models/helpCenter/types'
import {
    GuidanceForm,
    GuidanceFormFields,
} from './components/GuidanceForm/GuidanceForm'
import {useGuidanceArticleMutation} from './hooks/useGuidanceArticleMutation'
import {GuidanceTemplate} from './types'

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

    const onSubmit = async ({name, content}: GuidanceFormFields) => {
        await createGuidanceArticle({
            title: name,
            content,
            locale,
            visibility: 'PUBLIC',
        })
    }

    const initialFields = {
        name: guidanceTemplate.name,
        content: guidanceTemplate.content,
    }

    return (
        <GuidanceForm
            actionType="create"
            shopName={shopName}
            initialFields={initialFields}
            onSubmit={onSubmit}
            isLoading={isGuidanceArticleUpdating}
        />
    )
}
