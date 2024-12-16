import React from 'react'

import IconButton from 'pages/common/components/button/IconButton'

type RemoveCallExpressionProps = {
    index: number
    onClick: (index: number) => void
}

export function RemoveCallExpression({
    index,
    onClick,
}: RemoveCallExpressionProps) {
    return (
        <IconButton
            intent="destructive"
            fillStyle="ghost"
            onClick={() => onClick(index)}
            size="small"
        >
            clear
        </IconButton>
    )
}
