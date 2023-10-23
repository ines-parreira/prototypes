import {useEffect} from 'react'

import statusPageManager from 'services/statusPageManager/statusPageManager'

export default function useStatusPageManager() {
    useEffect(() => {
        statusPageManager.startPolling()

        return () => {
            statusPageManager.stopPolling()
        }
    }, [])
}
