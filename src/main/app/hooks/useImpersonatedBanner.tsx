import React from 'react'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getEnvironment } from 'utils/environment'

export function useImpersonatedBanner() {
    const { addBanner } = useBanners()
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)

    if (window.USER_IMPERSONATED) {
        addBanner({
            preventDismiss: true,
            category: BannerCategories.IMPERSONATION,
            instanceId: BannerCategories.IMPERSONATION,
            type: AlertBannerTypes.Warning,
            message: (
                <>
                    Impersonating <strong>{currentUser.get('email')}</strong> in{' '}
                    <strong>{getEnvironment()}</strong> environment.{' ['}
                    <strong>cluster:</strong> {window.GORGIAS_CLUSTER}
                    {', '}
                    <strong>account_id:</strong> {currentAccount.get('id')}
                    {', '}
                    <strong>user_id:</strong> {currentUser.get('id')}
                    {' ]'}
                </>
            ),
        })
    }
}
