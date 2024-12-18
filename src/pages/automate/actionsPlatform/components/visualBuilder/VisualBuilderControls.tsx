import React, {useCallback} from 'react'
import {ControlButton, Controls, useReactFlow} from 'reactflow'

import FitViewIcon from 'pages/automate/common/components/FitViewIcon'
import css from 'pages/automate/workflows/editor/visualBuilder/WorkflowVisualBuilder.less'

type Props = {
    isMiniMapHidden?: boolean
}

const VisualBuilderControls = ({isMiniMapHidden}: Props) => {
    const reactFlow = useReactFlow()
    const handleFitView = useCallback(() => reactFlow.fitView(), [reactFlow])

    return (
        <Controls
            className={css.controls}
            showFitView={false}
            showInteractive={false}
            position="top-left"
            style={!isMiniMapHidden ? {left: 200 + 15} : {}}
        >
            <ControlButton
                aria-label="fit view"
                title="fit view"
                onClick={handleFitView}
            >
                <FitViewIcon />
            </ControlButton>
        </Controls>
    )
}

export default VisualBuilderControls
