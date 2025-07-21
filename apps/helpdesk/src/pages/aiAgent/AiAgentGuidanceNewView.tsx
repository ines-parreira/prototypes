import { HelpCenter } from 'models/helpCenter/types'
import { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { GuidanceForm } from './components/GuidanceForm/GuidanceForm'
import { useGuidanceArticleMutation } from './hooks/useGuidanceArticleMutation'
import { GuidanceFormFields } from './types'
import { mapGuidanceFormFieldsToGuidanceArticle } from './utils/guidance.utils'

type Props = {
    helpCenter: HelpCenter
    availableActions: GuidanceAction[]
    shopName: string
}

export const AiAgentGuidanceNewView = ({
    helpCenter,
    availableActions,
    shopName,
}: Props) => {
    const { createGuidanceArticle, isGuidanceArticleUpdating } =
        useGuidanceArticleMutation({ guidanceHelpCenterId: helpCenter.id })

    const onSubmit = async (guidanceFormFields: GuidanceFormFields) => {
        await createGuidanceArticle(
            mapGuidanceFormFieldsToGuidanceArticle(
                guidanceFormFields,
                helpCenter.default_locale,
            ),
        )
    }

    return (
        <GuidanceForm
            shopName={shopName}
            actionType="create"
            availableActions={availableActions}
            isLoading={isGuidanceArticleUpdating}
            onSubmit={onSubmit}
            sourceType="scratch"
            helpCenterId={helpCenter.id}
        />
    )
}
