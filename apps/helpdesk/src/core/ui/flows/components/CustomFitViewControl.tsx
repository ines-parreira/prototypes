import React from 'react'

import { useReactFlow } from 'reactflow'

import { IconButton } from '@gorgias/axiom'

export function CustomFitViewControl(): React.JSX.Element {
    const { fitView } = useReactFlow()

    return (
        <IconButton
            icon={'filter_center_focus'}
            onClick={() => fitView()}
            fillStyle={'ghost'}
            intent={'secondary'}
        />
    )
}
