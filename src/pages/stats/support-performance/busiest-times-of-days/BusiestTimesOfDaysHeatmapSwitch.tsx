import React from 'react'
import * as ToggleButton from 'pages/common/components/ToggleButton'

export const BusiestTimesOfDaysHeatmapSwitch = ({
    isHeatmapMode,
    setIsHeatmapMode,
}: {
    isHeatmapMode: boolean
    setIsHeatmapMode: (flag: boolean) => void
}) => {
    const toggleHandler = () => setIsHeatmapMode(!isHeatmapMode)

    return (
        <ToggleButton.Wrapper
            type={ToggleButton.Type.Label}
            value={isHeatmapMode}
            onChange={toggleHandler}
            size={'small'}
        >
            <ToggleButton.Option value={false}>Table</ToggleButton.Option>
            <ToggleButton.Option value={true}>Heatmap</ToggleButton.Option>
        </ToggleButton.Wrapper>
    )
}
