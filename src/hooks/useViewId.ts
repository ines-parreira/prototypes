import { useMemo } from 'react'

import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getActiveView } from 'state/views/selectors'

export default function useViewId() {
    const { viewId: viewIdParam } = useParams<{ viewId?: string }>()

    const activeView = useAppSelector(getActiveView)
    const activeViewId = useMemo(
        () => activeView.get('id') as number | undefined,
        [activeView],
    )

    return useMemo(() => {
        if (viewIdParam) {
            return parseInt(viewIdParam, 10)
        }

        if (activeViewId) {
            return activeViewId
        }

        return 0
    }, [activeViewId, viewIdParam])
}
