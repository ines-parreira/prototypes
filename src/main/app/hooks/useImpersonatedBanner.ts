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
            message: `Impersonating <b>${
                currentUser.get('email') as string
            }</b> in <b>${getEnvironment()}</b> environment.
                [<b>cluster:</b> '${window.GORGIAS_CLUSTER}', <b>account_id:</b> ${
                    currentAccount.get('id') as string
                }, <b>user_id:</b> ${currentUser.get('id') as string}]`,
        })
    }
}
