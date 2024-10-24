import React from 'react'

import {Link, useParams} from 'react-router-dom'

import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

export default function BackToActionButton() {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})

    return (
        <Link to={routes.actions}>
            <Button fillStyle="ghost" intent="secondary">
                <ButtonIconLabel icon="arrow_back"></ButtonIconLabel>
                Back to Actions
            </Button>
        </Link>
    )
}
