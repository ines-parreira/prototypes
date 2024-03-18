import {useCallback} from 'react'
import {SCREEN_SIZE, useScreenSize} from 'hooks/useScreenSize'

export const useWidthBasedOnScreen = () => {
    const screenSize = useScreenSize()

    const getWidth = useCallback(
        (defaultWidth: number, customWidth: number) => {
            return screenSize === SCREEN_SIZE.SMALL ? customWidth : defaultWidth
        },
        [screenSize]
    )

    return getWidth
}
