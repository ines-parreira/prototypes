import {useWindowSize} from 'react-use'

export enum SCREEN_SIZE {
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
}

export const screenBreakPoints = [768, 1024]

export const useScreenSize = (): SCREEN_SIZE => {
    const {width} = useWindowSize()

    if (width <= screenBreakPoints[0]) {
        return SCREEN_SIZE.SMALL
    } else if (width <= screenBreakPoints[1]) {
        return SCREEN_SIZE.MEDIUM
    }

    return SCREEN_SIZE.LARGE
}
