import { useEffect, useState } from 'react'

import {
    isExtraLargeScreen,
    isMediumOrSmallScreen,
} from 'pages/common/utils/mobile'

export const useTaskDisplayLimit = () => {
    const [maxTasksToDisplay, setMaxTasksToDisplay] = useState(3)

    const computeLimit = () => {
        if (isMediumOrSmallScreen()) {
            return 3
        }
        if (isExtraLargeScreen()) {
            return 4
        }

        return 3
    }

    useEffect(() => {
        const handleResize = () => {
            setMaxTasksToDisplay(computeLimit())
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return maxTasksToDisplay
}
