import React, {useEffect} from 'react'

import {useHelpCenterActions} from '../../hooks/useHelpCenterActions'
import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {HelpCenterPreferencesSettings} from '../../providers/HelpCenterPreferencesSettings'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import {AvailableLanguagesTags} from './components/AvailableLanguagesTags'
import {DefaultLanguageSelect} from './components/DefaultLanguageSelect'
import {DisplayName} from './components/DisplayName'
import {FooterActions} from './components/FooterActions'
import {SEO} from './components/SEO'

export const HelpCenterPreferencesView: React.FC = () => {
    const locales = useSupportedLocales()
    const helpCenter = useCurrentHelpCenter()
    const {getHelpCenterCustomDomain} = useHelpCenterActions()

    useEffect(() => {
        void getHelpCenterCustomDomain()
    }, [])

    return (
        <HelpCenterPageWrapper helpCenter={helpCenter} showLanguageSelector>
            <HelpCenterPreferencesSettings helpCenter={helpCenter}>
                <DisplayName />
                <section>
                    <h3>Languages</h3>
                    <DefaultLanguageSelect availableLocales={locales} />
                    <AvailableLanguagesTags availableLocales={locales} />
                </section>
                <SEO helpCenter={helpCenter} />
                <FooterActions />
            </HelpCenterPreferencesSettings>
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterPreferencesView
