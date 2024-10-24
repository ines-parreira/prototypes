import React from 'react'

import * as ToggleButton from 'pages/common/components/ToggleButton'

export const TABLE_MODE_LABEL = 'Table'
export const HEATMAP_MODE_LABEL = 'Heatmap'

export const TableHeatmapSwitch = ({
    isHeatmapMode,
    toggleHandler,
}: {
    isHeatmapMode: boolean
    toggleHandler: () => void
}) => {
    return (
        <ToggleButton.Wrapper
            type={ToggleButton.Type.Label}
            value={isHeatmapMode}
            onChange={toggleHandler}
            size={'small'}
        >
            <ToggleButton.Option value={false}>
                {TABLE_MODE_LABEL}
            </ToggleButton.Option>
            <ToggleButton.Option value={true}>
                {HEATMAP_MODE_LABEL}
            </ToggleButton.Option>
        </ToggleButton.Wrapper>
    )
}
