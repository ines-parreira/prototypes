import { useCallback } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

export const useRemoveVersionIdParam = () => {
    const history = useHistory()
    const location = useLocation()

    return useCallback(() => {
        const params = new URLSearchParams(location.search)
        if (!params.has('versionId')) return
        params.delete('versionId')
        history.replace({ ...location, search: params.toString() })
    }, [history, location])
}
