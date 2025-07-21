import { useCallback } from 'react'

import { SCREEN_SIZE, useScreenSize } from 'hooks/useScreenSize'

export const useGridSize = () => {
    const screenSize = useScreenSize()

    const getGridCellSize = useCallback(
        (defaultSize: number) => {
            return screenSize === SCREEN_SIZE.SMALL ? 12 : defaultSize
        },
        [screenSize],
    )

    return getGridCellSize
}
