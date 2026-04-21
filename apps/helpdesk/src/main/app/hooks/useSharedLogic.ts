import { useEffectOnce } from '@repo/hooks'
import { identifyUser } from '@repo/logging'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import userActivityManager from 'services/userActivityManager'
import { handle2FAEnforced } from 'state/currentUser/actions'

export default function useSharedLogic() {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector((state) => state.currentUser)

    useEffectOnce(() => {
        userActivityManager.watch()

        identifyUser(currentUser.toJS())

        dispatch(handle2FAEnforced())
    })
}
