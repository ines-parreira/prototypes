import React from 'react'
import {HelpCenter} from 'models/helpCenter/types'
import {GuidanceForm} from './components/GuidanceForm/GuidanceForm'
import {useGuidanceArticleMutation} from './hooks/useGuidanceArticleMutation'
import {GuidanceFormFields} from './types'
import {mapGuidanceFormFieldsToGuidanceArticle} from './utils/guidance.utils'

type Props = {
    shopName: string
    helpCenter: HelpCenter
}

export const AiAgentGuidanceNewView = ({shopName, helpCenter}: Props) => {
    const {createGuidanceArticle, isGuidanceArticleUpdating} =
        useGuidanceArticleMutation({guidanceHelpCenterId: helpCenter.id})

    const onSubmit = async (guidanceFormFields: GuidanceFormFields) => {
        await createGuidanceArticle(
            mapGuidanceFormFieldsToGuidanceArticle(
                guidanceFormFields,
                helpCenter.default_locale
            )
        )
    }

    return (
        <GuidanceForm
            actionType="create"
            shopName={shopName}
            isLoading={isGuidanceArticleUpdating}
            onSubmit={onSubmit}
            sourceType="scratch"
        />
    )
}
