import React from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import history from 'pages/history'

type Props = {
    baseURL: string
}

export default function BackButton({baseURL}: Props) {
    return (
        <Button
            onClick={() => history.push(baseURL)}
            intent="secondary"
            fillStyle="ghost"
            className="p-0 mb-4"
        >
            <ButtonIconLabel icon="arrow_back">Verification</ButtonIconLabel>
        </Button>
    )
}
