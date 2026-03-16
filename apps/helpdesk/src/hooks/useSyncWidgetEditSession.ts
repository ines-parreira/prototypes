import { useEffect } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import * as widgetActions from 'state/widgets/actions'
import type { WidgetEnvironment } from 'state/widgets/types'

type Props = {
    context: WidgetEnvironment
    isEditSessionActive: boolean
    isEditSessionRequested: boolean
}

export default function useSyncWidgetEditSession({
    context,
    isEditSessionActive,
    isEditSessionRequested,
}: Props) {
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (isEditSessionRequested === isEditSessionActive) {
            return
        }

        if (isEditSessionRequested) {
            dispatch(widgetActions.startEditionMode(context))
            return
        }

        dispatch(widgetActions.stopEditionMode())
    }, [context, dispatch, isEditSessionActive, isEditSessionRequested])
}
