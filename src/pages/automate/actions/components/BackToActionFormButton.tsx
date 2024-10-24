import React from 'react'

import {Link, useParams} from 'react-router-dom'

import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

export default function BackToActionFormButton() {
    const {shopName, id} = useParams<{
        id: string
        shopName: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})

    return (
        <Link to={() => routes.editAction(id)}>
            <Button fillStyle="ghost" intent="secondary">
                <ButtonIconLabel icon="arrow_back"></ButtonIconLabel>
                Back to Action
            </Button>
        </Link>
    )
}
