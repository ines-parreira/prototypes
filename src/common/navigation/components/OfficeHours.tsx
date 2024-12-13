import cn from 'classnames'
import React from 'react'

import {useFlag} from 'common/flags'
import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/common/components/Navbar.less'
import {getCurrentHelpdeskPlan} from 'state/billing/selectors'
import {isTrialing as getIsTrialing} from 'state/currentAccount/selectors'

type Props = {
    onToggleDropdown: () => void
}

export default function OfficeHours({onToggleDropdown}: Props) {
    const hasOfficeHours = useFlag<boolean>(FeatureFlagKey.OfficeHours, false)
    const product = useAppSelector(getCurrentHelpdeskPlan)
    const isTrialing = useAppSelector(getIsTrialing)

    const isPro = product?.name.toLowerCase() === 'pro'

    if (!isPro || isTrialing || !hasOfficeHours) {
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
                })
                onToggleDropdown()
            }}
        >
            <i className={cn('material-icons mr-2', css.icon)}>event</i>
            Book office hours
        </a>
    )
}
