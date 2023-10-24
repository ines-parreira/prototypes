import React, {useRef, useState} from 'react'
import classNames from 'classnames'
import useAppSelector from 'hooks/useAppSelector'
import {hasIntegrationOfTypes} from 'state/integrations/selectors'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import {IntegrationType} from 'models/integration/constants'
import cssNavbar from 'assets/css/navbar.less'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import PaywallPopover from 'pages/settings/new_billing/components/PaywallPopover'
import {VOICE_LEARN_MORE_URL} from 'pages/stats/voice/constants/voiceOverview'
import css from './VoiceStatsNavbarItem.less'

type Props = {
    to: string
    title: string
    commonNavLinkProps: Partial<NavbarLinkProps>
}

function VoiceStatsNavbarItem({to, title, commonNavLinkProps}: Props) {
    const iconRef = useRef<HTMLElement>(null)

    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const hasVoiceIntegrations = useAppSelector(
        hasIntegrationOfTypes([IntegrationType.Phone])
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
                {hasVoiceIntegrations ? (
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
