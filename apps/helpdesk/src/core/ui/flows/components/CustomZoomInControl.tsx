import React from 'react'

import { useReactFlow, useViewport } from '@xyflow/react'

import { LegacyIconButton as IconButton } from '@gorgias/axiom'

export function CustomZoomInControl(): React.JSX.Element {
    const { zoom } = useViewport()
    const { zoomIn } = useReactFlow()

    return (
        <IconButton
            onClick={() => zoomIn()}
            isDisabled={zoom >= 1.5}
            fillStyle={'ghost'}
            icon={'zoom_in'}
            intent={'secondary'}
        />
    )
}
