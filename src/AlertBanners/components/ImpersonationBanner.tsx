import { AlertBanner, AlertBannerTypes } from 'AlertBanners'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import useAppSelector from '../../hooks/useAppSelector'
import { getCurrentAccountState } from '../../state/currentAccount/selectors'
import { getCurrentUser } from '../../state/currentUser/selectors'
import { getEnvironment } from '../../utils/environment'

import css from './AlertBanner.less'

const ImpersonationBanner = () => {
    const carouselBannerFlag: boolean = useFlag(
        FeatureFlagKey.BannerCarousel,
        false,
    )

    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)

    if (window.USER_IMPERSONATED) {
        return (
            <AlertBanner
                type={AlertBannerTypes.Warning}
                prefix={
                    carouselBannerFlag && (
                        <div className={css.prefixHolder}></div>
                    )
                }
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
