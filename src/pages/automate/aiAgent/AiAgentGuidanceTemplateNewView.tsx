import React from 'react'
import {notify} from 'reapop'
import {LocaleCode} from 'models/helpCenter/types'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
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
    const dispatch = useAppDispatch()
    const {guidanceTemplate} = useGuidanceTemplate(templateId)
    const {createGuidanceArticle, isGuidanceArticleUpdating} =
        useGuidanceArticleMutation({
            guidanceHelpCenterId,
        })

    const onSubmit = async ({name, content}: GuidanceFormFields) => {
        try {
            await createGuidanceArticle({
                title: name,
                content,
                locale,
                visibility: 'PUBLIC',
            })
        } catch (err) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article creation.',
                })
            )
        }
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
