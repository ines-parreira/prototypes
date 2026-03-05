import { useEffect } from 'react'

import { isAdmin } from '@repo/utils'

import type { ContextBanner } from 'AlertBanners'
import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { BillingAddressValidationStatus } from 'models/billing/types'
import { BILLING_PAYMENT_PATH } from 'pages/settings/new_billing/constants'
import { getCurrentUser } from 'state/currentUser/selectors'

const INSTANCE_ID = 'billing-address-validation'
const banner: ContextBanner = {
    'aria-label': 'Billing Address Validation',
    category: BannerCategories.BILLING_ADDRESS_VALIDATION,
    type: AlertBannerTypes.Warning,
    instanceId: INSTANCE_ID,
    message:
        'Your billing address is invalid. Please update it to avoid service interruptions.',
    CTA: {
        type: 'internal',
        text: 'Update billing address',
        to: BILLING_PAYMENT_PATH,
    },
}

export const useBillingAddressValidationBanner = () => {
    const { addBanner, removeBanner } = useBanners()
    const currentUser = useAppSelector(getCurrentUser)
    const isUserAdmin = isAdmin(currentUser.toJS())
    const { data: billingState } = useBillingState()

    const shouldShowBanner =
        isUserAdmin &&
        billingState?.customer.billing_address_validation_status ===
            BillingAddressValidationStatus.Invalid

    useEffect(() => {
        if (shouldShowBanner) {
            addBanner(banner)
        } else {
            removeBanner(banner.category, banner.instanceId)
        }
    }, [addBanner, removeBanner, shouldShowBanner])
}
