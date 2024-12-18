import React from 'react'

import Button from 'pages/common/components/button/Button'
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
            leadingIcon="arrow_back"
        >
            Verification
        </Button>
    )
}
