import React from 'react'

import { useReactFlow, useViewport } from 'reactflow'

import { IconButton } from '@gorgias/merchant-ui-kit'

export function CustomZoomInControl(): React.JSX.Element {
    const { zoom } = useViewport()
    const { zoomIn } = useReactFlow()

    return (
        <IconButton
            onClick={() => zoomIn()}
            isDisabled={zoom >= 1}
            fillStyle={'ghost'}
            icon={'zoom_in'}
            intent={'secondary'}
        />
    )
}
