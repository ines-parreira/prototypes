import { useEffectOnce } from '@repo/hooks'

import { identifyUser } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import userActivityManager from 'services/userActivityManager'
import { handle2FAEnforced } from 'state/currentUser/actions'
import { fetchVisibleViewsCounts } from 'state/views/actions'

export default function useSharedLogic() {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector((state) => state.currentUser)

    useEffectOnce(() => {
        userActivityManager.watch()

        // ask for the newest view counts
        dispatch(fetchVisibleViewsCounts())

        identifyUser(currentUser.toJS())

        dispatch(handle2FAEnforced())
    })
}
