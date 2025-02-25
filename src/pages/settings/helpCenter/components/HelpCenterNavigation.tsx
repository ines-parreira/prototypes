import React, { useState } from 'react'

import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { NavLink, useHistory } from 'react-router-dom'

import dotError from 'assets/img/icons/dot-error.svg'
import { TicketChannel } from 'business/types/ticket'
import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'
import { getHasAutomate } from 'state/billing/selectors'

import { useHasAccessToAILibrary } from './AIArticlesLibraryView/hooks/useHasAccessToAILibrary'

import css from './HelpCenterNavigation.less'

type Props = {
    helpCenterId: string | number
    helpCenterShopName?: string | null
    cannotUpdateHelpCenter?: boolean
}

export const HelpCenterNavigation: React.FC<Props> = ({
    cannotUpdateHelpCenter = false,
    helpCenterId,
    helpCenterShopName,
}: Props) => {
    const baseURL = `/app/settings/help-center/${helpCenterId}`
    const hasAutomate = useAppSelector(getHasAutomate)
    const history = useHistory()

    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

    const showAILibraryTab = useHasAccessToAILibrary()

    const logHelpCenterEvent = (version: string) => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingButtonClicked, {
            channel: TicketChannel.HelpCenter,
            version,
        })
    }

    if (cannotUpdateHelpCenter) {
        return null
    }

    return (
        <SecondaryNavbar>
            <NavLink to={`${baseURL}/articles`} exact>
                Articles
            </NavLink>
            {showAILibraryTab && (
                <NavLink
                    to={`${baseURL}/ai-library`}
                    onClick={(ev) => {
                        ev.preventDefault()
                        history.push(`${baseURL}/ai-library`, {
                            from: 'ai-library-tab-clicked',
                        })
                    }}
                >
                    <i
                        className={classNames(
                            'material-icons',
                            css.autoAwesome,
                        )}
                    >
                        auto_awesome
                    </i>
                    AI Library
                </NavLink>
            )}
            <NavLink to={`${baseURL}/contact`}>Contact</NavLink>
            <NavLink to={`${baseURL}/appearance`}>Appearance</NavLink>
            <NavLink to={`${baseURL}/preferences`} exact>
                Preferences
            </NavLink>
            <NavLink to={`${baseURL}/customization`} exact>
                Customization
            </NavLink>
            <NavLink to={`${baseURL}/publish-track`}>Publish & Track</NavLink>
            {hasAutomate && (
                <NavLink to={`${baseURL}/automate`}>
                    Automate
                    {!helpCenterShopName && (
                        <img
                            alt="status icon"
                            src={dotError}
                            className={css.redDot}
                        />
                    )}
                </NavLink>
            )}
            {changeAutomateSettingButtomPosition && !hasAutomate && (
                <>
                    <AutomateSubscriptionButton
                        fillStyle="ghost"
                        label="Upgrade to Automate"
                        onClick={() => {
                            logHelpCenterEvent('Upsell')
                            setIsAutomationModalOpened(true)
                        }}
                    />
                    <AutomateSubscriptionModal
                        confirmLabel="Subscribe"
                        isOpen={isAutomationModalOpened}
                        onClose={() => {
                            setIsAutomationModalOpened(false)
                        }}
                    />
                </>
            )}
        </SecondaryNavbar>
    )
}
