import React from 'react'
import {notify} from 'reapop'
import {HelpCenter} from 'models/helpCenter/types'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
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
    const dispatch = useAppDispatch()
    const {createGuidanceArticle, isGuidanceArticleUpdating} =
        useGuidanceArticleMutation({guidanceHelpCenterId: helpCenter.id})

    const onSubmit = async ({name, content}: GuidanceFormFields) => {
        try {
            await createGuidanceArticle({
                title: name,
                content,
                locale: helpCenter.default_locale,
                visibility: 'PUBLIC',
            })
        } catch (e) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article creation.',
                })
            )
        }
    }

    return (
        <GuidanceForm
            shopName={shopName}
            isLoading={isGuidanceArticleUpdating}
            onSubmit={onSubmit}
        />
    )
}
