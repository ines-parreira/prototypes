import React from 'react'
import {HelpCenter} from 'models/helpCenter/types'
import {
    GuidanceForm,
    GuidanceFormFields,
} from './components/GuidanceForm/GuidanceForm'
import {useGuidanceArticleMutation} from './hooks/useGuidanceArticleMutation'

type Props = {
    shopName: string
    helpCenter: HelpCenter
}

export const AiAgentGuidanceNewView = ({shopName, helpCenter}: Props) => {
    const {createGuidanceArticle, isGuidanceArticleUpdating} =
        useGuidanceArticleMutation({guidanceHelpCenterId: helpCenter.id})

    const onSubmit = async ({name, content}: GuidanceFormFields) => {
        await createGuidanceArticle({
            title: name,
            content,
            locale: helpCenter.default_locale,
            visibility: 'PUBLIC',
        })
    }

    return (
        <GuidanceForm
            actionType="create"
            shopName={shopName}
            isLoading={isGuidanceArticleUpdating}
            onSubmit={onSubmit}
        />
    )
}
