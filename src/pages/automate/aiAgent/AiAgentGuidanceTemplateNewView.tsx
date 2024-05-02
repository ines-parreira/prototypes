import React from 'react'
import {LocaleCode} from 'models/helpCenter/types'
import {
    GuidanceForm,
    GuidanceFormFields,
} from './components/GuidanceForm/GuidanceForm'
import {GuidanceTemplateKey} from './types'
import {useGuidanceTemplate} from './hooks/useGuidanceTemplate'
import {useGuidanceArticleMutation} from './hooks/useGuidanceArticleMutation'

type Props = {
    shopName: string
    templateId: GuidanceTemplateKey
    guidanceHelpCenterId: number
    locale: LocaleCode
}

export const AiAgentGuidanceTemplateNewView = ({
    shopName,
    templateId,
    guidanceHelpCenterId,
    locale,
}: Props) => {
    const {guidanceTemplate} = useGuidanceTemplate(templateId)
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
