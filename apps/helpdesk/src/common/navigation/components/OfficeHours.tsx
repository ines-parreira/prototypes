import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import cn from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'
import { isTrialing as getIsTrialing } from 'state/currentAccount/selectors'
import { getCompanyFixedGmvBandTier } from 'state/currentCompany/selectors'
import { CompanyTier } from 'state/currentCompany/types'
import { getCurrentUser } from 'state/currentUser/selectors'

import css from './UserMenu.less'

type Props = {
    onToggleDropdown: () => void
}

export default function OfficeHours({ onToggleDropdown }: Props) {
    const hasOfficeHours = useFlag(FeatureFlagKey.OfficeHours)
    const product = useAppSelector(getCurrentHelpdeskPlan)
    const isTrialing = useAppSelector(getIsTrialing)
    const currentUser = useAppSelector(getCurrentUser)
    const gmvBandTier = useAppSelector(getCompanyFixedGmvBandTier)

    const eligibleTiers = [CompanyTier.Band1, CompanyTier.Band2]
    const isEligibleByGmvBand =
        gmvBandTier && eligibleTiers.includes(gmvBandTier)

    // Fallback to Pro plan check if GMV band tier is not available
    const isPro = product?.name.toLowerCase() === 'pro'
    const shouldShowCta = gmvBandTier ? isEligibleByGmvBand : isPro

    if (!shouldShowCta || isTrialing || !hasOfficeHours) {
        return null
    }

    return (
        <a
            className={cn(css['dropdown-item-user-menu'])}
            href="https://calendly.com/gorgias-office-hours?utm_source=helpdesk&utm_medium=in_product&utm_campaign=user_menu"
            rel="noreferrer"
            target="_blank"
            title="Book a meeting with a Customer Success Manager at Gorgias."
            onClick={() => {
                logEvent(SegmentEvent.MenuUserLinkClicked, {
                    link: 'office-hours',
                    user_email: currentUser.get('email'),
                    user_role: currentUser.getIn(['role', 'name']),
                })
                onToggleDropdown()
            }}
        >
            <i className={cn('material-icons mr-2', css.icon)}>event</i>
            Book office hours
        </a>
    )
}
