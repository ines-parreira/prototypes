import React, {useState} from 'react'
import {NavLink, useHistory} from 'react-router-dom'

import {useFlags} from 'launchdarkly-react-client-sdk'
import classNames from 'classnames'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {TicketChannel} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import Button from 'pages/common/components/button/Button'
import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {LocaleCode} from 'models/helpCenter/types'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'

import {useSelfServiceStoreIntegrationByShopName} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {useConditionalGetAIArticles} from '../hooks/useConditionalGetAIArticles'
import css from './HelpCenterNavigation.less'
import {useHasAccessToAILibrary} from './AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import {MINIMUM_AI_ARTICLES} from './CategoriesView/components/ArticleTemplateCard/constants'

type Props = {
    helpCenterId: string | number
    helpCenterShopName?: string | null
    cannotUpdateHelpCenter?: boolean
    isConnectStoreLinkEnabled?: boolean
    locale: LocaleCode
}

export const HelpCenterNavigation: React.FC<Props> = ({
    cannotUpdateHelpCenter = false,
    helpCenterId,
    helpCenterShopName,
    isConnectStoreLinkEnabled = true,
    locale,
}: Props) => {
    const baseURL = `/app/settings/help-center/${helpCenterId}`
    const hasAutomate = useAppSelector(getHasAutomate)
    const history = useHistory()

    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

    const hasAccessToAILibrary = useHasAccessToAILibrary()

    const storeIntegration = useSelfServiceStoreIntegrationByShopName(
        helpCenterShopName ?? ''
    )
    const {fetchedArticles: aiArticles} = useConditionalGetAIArticles(
        Number(helpCenterId),
        Number(storeIntegration?.id),
        locale
    )

    const showAILibraryTab =
        hasAccessToAILibrary && (aiArticles?.length ?? 0) >= MINIMUM_AI_ARTICLES

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
                            css.autoAwesome
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
            {changeAutomateSettingButtomPosition &&
                (hasAutomate ? (
                    <>
                        {helpCenterShopName ? (
                            <Button
                                fillStyle="ghost"
                                intent="primary"
                                className={css.automateSettingsButton}
                                onClick={() => {
                                    logHelpCenterEvent('Setting')
                                    history.push(
                                        `/app/automation/shopify/${helpCenterShopName}/connected-channels?type=${TicketChannel.HelpCenter}&id=${helpCenterId}`,
                                        {from: 'help-center-settings'}
                                    )
                                }}
                            >
                                <ButtonIconLabel icon="bolt">
                                    Automate Settings
                                </ButtonIconLabel>
                            </Button>
                        ) : (
                            <Button
                                fillStyle="ghost"
                                intent="primary"
                                onClick={() => {
                                    logHelpCenterEvent('Store')
                                    if (isConnectStoreLinkEnabled) {
                                        history.push(
                                            `/app/settings/help-center/${helpCenterId}/publish-track`
                                        )
                                    }
                                }}
                            >
                                <ButtonIconLabel
                                    icon="warning"
                                    className={css.connectStoreWarning}
                                >
                                    Connect to Automate
                                </ButtonIconLabel>
                            </Button>
                        )}
                    </>
                ) : (
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
                ))}
        </SecondaryNavbar>
    )
}
