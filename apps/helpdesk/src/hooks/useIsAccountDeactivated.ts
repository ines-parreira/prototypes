import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

export const useIsAccountDeactivated = () => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const deactivatedDatetime = currentAccount.get('deactivated_datetime') as
        | string
        | null

    return !!deactivatedDatetime
}
