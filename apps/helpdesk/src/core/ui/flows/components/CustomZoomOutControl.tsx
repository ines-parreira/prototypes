import React from 'react'

import { useReactFlow, useViewport } from '@xyflow/react'

import { IconButton } from '@gorgias/axiom'

export function CustomZoomOutControl(): React.JSX.Element {
    const { zoom } = useViewport()
    const { zoomOut } = useReactFlow()

    return (
        <IconButton
            onClick={() => zoomOut()}
            isDisabled={zoom <= 0.1}
            fillStyle={'ghost'}
            icon={'zoom_out'}
            intent={'secondary'}
        />
    )
}
