import React, {useEffect} from 'react'

import settingsCss from 'pages/settings/settings.less'

import {useHelpCenterActions} from '../../hooks/useHelpCenterActions'
import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {useHelpCenterPreferencesSettings} from '../../providers/HelpCenterPreferencesSettings'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import {ConnectToShopSection} from '../ConnectToShopSection'
import {AvailableLanguagesTags} from './components/AvailableLanguagesTags'
import {DefaultLanguageSelect} from './components/DefaultLanguageSelect'
import {FooterActions} from './components/FooterActions'
import {SEO} from './components/SEO'

export const HelpCenterPreferencesView: React.FC = () => {
    const locales = useSupportedLocales()
    const helpCenter = useCurrentHelpCenter()
    const {getHelpCenterCustomDomain} = useHelpCenterActions()
    const {
        preferences,
        savePreferences,
        canSavePreferences,
        updatePreferences,
    } = useHelpCenterPreferencesSettings()

    useEffect(() => {
        void getHelpCenterCustomDomain()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onConnectedShopChange = ({
        shop_name,
        self_service_deactivated,
    }: {
        shop_name: string | null
        self_service_deactivated?: boolean
    }) => {
        updatePreferences({
            connectedShop: {
                shopName: shop_name,
                selfServiceDeactivated: Boolean(self_service_deactivated),
            },
        })
    }

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            showLanguageSelector
            onSaveChanges={savePreferences}
            isDirty={canSavePreferences}
            isConnectStoreLinkEnabled={false}
        >
            <ConnectToShopSection
                onUpdate={onConnectedShopChange}
                shopName={preferences.connectedShop.shopName}
            />
            <section className={settingsCss.mb40}>
                <h3>Languages</h3>
                <DefaultLanguageSelect availableLocales={locales} />
                <AvailableLanguagesTags availableLocales={locales} />
            </section>
            <SEO helpCenter={helpCenter} />
            <FooterActions />
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterPreferencesView
