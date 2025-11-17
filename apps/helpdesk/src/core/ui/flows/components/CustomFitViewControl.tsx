import type React from 'react'

import { useReactFlow } from '@xyflow/react'

import { LegacyIconButton as IconButton } from '@gorgias/axiom'

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
