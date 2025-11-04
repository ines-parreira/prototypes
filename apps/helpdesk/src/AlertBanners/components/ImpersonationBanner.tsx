import { getEnvironment } from '@repo/utils'

import { AlertBannerTypes } from 'AlertBanners'
import { AlertBanner } from 'AlertBanners/components/AlertBanner'

import useAppSelector from '../../hooks/useAppSelector'
import { getCurrentAccountState } from '../../state/currentAccount/selectors'
import { getCurrentUser } from '../../state/currentUser/selectors'

const ImpersonationBanner = () => {
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)

    if (window.USER_IMPERSONATED) {
        return (
            <AlertBanner
                type={AlertBannerTypes.Warning}
                message={
                    <>
                        Impersonating{' '}
                        <strong>{currentUser.get('email')}</strong> in{' '}
                        <strong>{getEnvironment()}</strong> environment.{' ['}
                        <strong>cluster:</strong> {window.GORGIAS_CLUSTER}
                        {', '}
                        <strong>account_id:</strong> {currentAccount.get('id')}
                        {', '}
                        <strong>user_id:</strong> {currentUser.get('id')}
                        {' ]'}
                    </>
                }
            />
        )
    }

    return null
}

export default ImpersonationBanner
