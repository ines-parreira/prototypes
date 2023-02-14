import React from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

type Props = {
    className?: string
    isVisible: boolean
    onClick: (isVisible: boolean) => void
}

export default function TipsToggle({className, isVisible, onClick}: Props) {
    return (
        <Button
            className={className}
            fillStyle="ghost"
            onClick={() => onClick(!isVisible)}
        >
            <ButtonIconLabel icon={isVisible ? 'visibility_off' : 'visibility'}>
                {isVisible ? 'Hide tips' : 'Show tips'}
            </ButtonIconLabel>
        </Button>
    )
}
