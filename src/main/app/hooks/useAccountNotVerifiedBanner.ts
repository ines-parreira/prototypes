import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { resendVerificationEmail } from 'state/currentAccount/actions'
import { getBaseEmailIntegration } from 'state/integrations/selectors'

export function useAccountNotVerifiedBanner() {
    const dispatch = useAppDispatch()
    const { addBanner } = useBanners()
    const baseEmailIntegration = useAppSelector(getBaseEmailIntegration)

    if (!baseEmailIntegration.getIn(['meta', 'verified'], true)) {
        addBanner({
            preventDismiss: true,
            category: BannerCategories.ACCOUNT_NOT_VERIFIED,
            instanceId: BannerCategories.ACCOUNT_NOT_VERIFIED,
            type: AlertBannerTypes.Warning,
            message: 'Your email address is not verified.',
            CTA: {
                type: 'action',
                text: 'Resend verification email',
                onClick: () => dispatch(resendVerificationEmail()),
            },
        })
    }
}
