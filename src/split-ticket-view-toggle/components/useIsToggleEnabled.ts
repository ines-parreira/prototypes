import {useLocation} from 'react-router-dom'
import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {ViewType} from 'models/view/types'
import {getActiveView} from 'state/views/selectors'
import {isDirectTicketPath} from 'utils'

export default function useIsToggleEnabled() {
    const {pathname: path} = useLocation()
    const activeView = useAppSelector(getActiveView)

    const activeViewId = useMemo(
        () => activeView.get('id') as number,
        [activeView]
    )

    const activeViewType = useMemo(
        () => activeView.get('type') as ViewType,
        [activeView]
    )

    return useMemo(
        () => ({
            isEnabled: isDirectTicketPath(path)
                ? !!activeViewId && activeViewType === ViewType.TicketList
                : true,
        }),
        [path, activeViewId, activeViewType]
    )
}
