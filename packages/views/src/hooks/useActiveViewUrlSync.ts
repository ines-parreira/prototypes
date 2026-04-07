import { useEffect } from 'react'

import { useParams } from 'react-router-dom'

import { setActiveViewId } from '../store/activeViewStore'

export function useActiveViewUrlSync(): void {
    const params = useParams<{ viewId?: string }>()

    useEffect(() => {
        if ('viewId' in params) {
            const viewId = parseInt(params.viewId!, 10)
            if (!Number.isNaN(viewId)) {
                setActiveViewId(viewId)
            }
        }
    }, [params])
}
