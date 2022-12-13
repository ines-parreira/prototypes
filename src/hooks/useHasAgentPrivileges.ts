import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import {hasAgentPrivileges} from 'utils'

const useHasAgentPrivileges = () => {
    const currentUser = useAppSelector(getCurrentUser)

    return hasAgentPrivileges(currentUser)
}

export default useHasAgentPrivileges
