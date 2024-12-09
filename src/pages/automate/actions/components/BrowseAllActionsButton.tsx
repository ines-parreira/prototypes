import React from 'react'

import {Link, useParams} from 'react-router-dom'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import Button from 'pages/common/components/button/Button'

export default function CreateCustomActionButton() {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})

    const isMultiStepActionEnabled = useFlag(
        FeatureFlagKey.ActionsMultiStep,
        false
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
