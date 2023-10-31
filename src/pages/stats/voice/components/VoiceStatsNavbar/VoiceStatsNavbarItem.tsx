import React, {useRef, useState} from 'react'
import classNames from 'classnames'
import useAppSelector from 'hooks/useAppSelector'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import cssNavbar from 'assets/css/navbar.less'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import PaywallPopover from 'pages/settings/new_billing/components/PaywallPopover'
import {VOICE_LEARN_MORE_URL} from 'pages/stats/voice/constants/voiceOverview'
import {currentAccountHasFeature} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import css from './VoiceStatsNavbarItem.less'

type Props = {
    to: string
    title: string
    commonNavLinkProps: Partial<NavbarLinkProps>
}

function VoiceStatsNavbarItem({to, title, commonNavLinkProps}: Props) {
    const iconRef = useRef<HTMLElement>(null)

    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const hasVoiceFeature = useAppSelector(
        currentAccountHasFeature(AccountFeature.PhoneNumber)
    )

    return (
        <div
            className={classNames(
                cssNavbar['link-wrapper'],
                cssNavbar.isNested
            )}
        >
            <NavbarLink {...commonNavLinkProps} to={to}>
                {title}
                {hasVoiceFeature ? (
                    <Badge type={ColorType.Blue} className={cssNavbar.badge}>
                        NEW
                    </Badge>
                ) : (
                    <UpgradeIcon
                        iconRef={iconRef}
                        onMouseEnter={() => {
                            setIsPopoverOpen(true)
                        }}
                    />
                )}
                <PaywallPopover
                    featureName={'Voice add-on'}
                    iconRef={iconRef}
                    isOpened={isPopoverOpen}
                    setIsOpened={setIsPopoverOpen}
                    buttonContent={'Learn more'}
                    buttonClassName={css.learnMoreButton}
                    onButtonClick={() => {
                        const windowRef = window.open(
                            VOICE_LEARN_MORE_URL,
                            '_blank',
                            'noopener'
                        )
                        windowRef?.focus()
                    }}
                />
            </NavbarLink>
        </div>
    )
}

export default VoiceStatsNavbarItem
