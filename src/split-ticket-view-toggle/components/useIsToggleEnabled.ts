import {useLocation} from 'react-router-dom'
import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getActiveView} from 'state/views/selectors'
import {isDirectTicketPath} from 'utils'

export default function useIsToggleEnabled() {
    const {pathname: path} = useLocation()
    const activeView = useAppSelector(getActiveView)
    const activeViewId = useMemo(
        () => activeView.get('id') as number,
        [activeView]
    )

    return useMemo(() => {
        return {isEnabled: isDirectTicketPath(path) ? !!activeViewId : true}
    }, [path, activeViewId])
}
