import { useParams } from 'react-router-dom'

import PostCompletionWizardModal from '../AiAgentOnboardingWizard/PostCompletionWizardModal'
import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { TEST } from '../constants'
import { AiAgentPlaygroundView } from './AiAgentPlaygroundView'

import css from './AiAgentPlaygroundContainer.less'

export const AiAgentPlaygroundContainer = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={TEST}
        >
            <AiAgentPlaygroundView shopName={shopName} />

            <PostCompletionWizardModal />
        </AiAgentLayout>
    )
}
