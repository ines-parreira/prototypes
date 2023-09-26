import React from 'react'

import settingsCss from 'pages/settings/settings.less'

import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {useHelpCenterPreferencesSettings} from '../../providers/HelpCenterPreferencesSettings'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import css from './HelpCenterPreferencesView.less'
import {AvailableLanguagesTags} from './components/AvailableLanguagesTags'
import {DefaultLanguageSelect} from './components/DefaultLanguageSelect'
import {FooterActions} from './components/FooterActions'
import {SEO} from './components/SEO'

export const HelpCenterPreferencesView: React.FC = () => {
    const locales = useSupportedLocales()
    const helpCenter = useCurrentHelpCenter()
    const {savePreferences, canSavePreferences} =
        useHelpCenterPreferencesSettings()

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            showLanguageSelector
            onSaveChanges={savePreferences}
            isDirty={canSavePreferences}
            isConnectStoreLinkEnabled={false}
        >
            <section className={settingsCss.mb40}>
                <h3 className={css.title}>Languages</h3>
                <DefaultLanguageSelect />
                <AvailableLanguagesTags availableLocales={locales} />
            </section>
            <SEO helpCenter={helpCenter} />
            <FooterActions />
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterPreferencesView
