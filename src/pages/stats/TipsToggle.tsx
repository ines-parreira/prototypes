import React from 'react'

import Button from 'pages/common/components/button/Button'

type Props = {
    className?: string
    isVisible: boolean
    onClick: (isVisible: boolean) => void
}

export default function TipsToggle({ className, isVisible, onClick }: Props) {
    return (
        <Button
            className={className}
            fillStyle="ghost"
            onClick={() => onClick(!isVisible)}
            leadingIcon={isVisible ? 'visibility_off' : 'visibility'}
        >
            {isVisible ? 'Hide tips' : 'Show tips'}
        </Button>
    )
}
