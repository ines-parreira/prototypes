import { useState } from 'react'

import { useParams } from 'react-router-dom'

import PlaygroundActionsToggle from 'pages/aiAgent/Playground/components/PlaygroundActionsToggle/PlaygroundActionsToggle'

import PostCompletionWizardModal from '../AiAgentOnboardingWizard/PostCompletionWizardModal'
import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { TEST } from '../constants'
import { AiAgentPlaygroundView } from './AiAgentPlaygroundView'

import css from './AiAgentPlaygroundContainer.less'

export const AiAgentPlaygroundContainer = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const [arePlaygroundActionsAllowed, setArePlaygroundActionsAllowed] =
        useState<boolean>(false)

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={TEST}
            titleChildren={
                <PlaygroundActionsToggle
                    value={arePlaygroundActionsAllowed}
                    onChange={() =>
                        setArePlaygroundActionsAllowed(
                            !arePlaygroundActionsAllowed,
                        )
                    }
                />
            }
        >
            <AiAgentPlaygroundView
                shopName={shopName}
                arePlaygroundActionsAllowed={arePlaygroundActionsAllowed}
            />

            <PostCompletionWizardModal />
        </AiAgentLayout>
    )
}
