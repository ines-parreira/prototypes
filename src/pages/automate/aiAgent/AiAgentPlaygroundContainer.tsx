import React from 'react'
import {useParams} from 'react-router-dom'

import PostCompletionWizardModal from './AiAgentOnboardingWizard/PostCompletionWizardModal'
import css from './AiAgentPlaygroundContainer.less'
import {AiAgentPlaygroundView} from './AiAgentPlaygroundView'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'

export const AiAgentPlaygroundContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()

    return (
        <AiAgentLayout shopName={shopName} className={css.container}>
            <AiAgentPlaygroundView shopName={shopName} />

            <PostCompletionWizardModal />
        </AiAgentLayout>
    )
}
