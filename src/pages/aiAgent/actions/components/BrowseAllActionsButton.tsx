import React from 'react'

import {Link, useParams} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import Button from 'pages/common/components/button/Button'

export default function CreateCustomActionButton() {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})

    const isMultiStepActionEnabled = useFlag(
        FeatureFlagKey.ActionsUseCaseTemplates
    )

    return (
        <Link to={routes.actionsTemplates}>
            <Button>
                {isMultiStepActionEnabled
                    ? 'Create from template'
                    : 'Browse all actions'}
            </Button>
        </Link>
    )
}
