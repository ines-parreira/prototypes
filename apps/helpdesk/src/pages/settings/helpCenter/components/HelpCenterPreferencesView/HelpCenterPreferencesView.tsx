import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import { useHelpCenterPreferencesSettings } from '../../providers/HelpCenterPreferencesSettings/HelpCenterPreferencesSettings'
import { useSupportedLocales } from '../../providers/SupportedLocales'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import { AvailableLanguagesTags } from './components/AvailableLanguagesTags'
import { DefaultLanguageSelect } from './components/DefaultLanguageSelect'
import { FooterActions } from './components/FooterActions/FooterActions'
import { SEO } from './components/SEO'

import css from './HelpCenterPreferencesView.less'

export const HelpCenterPreferencesView: React.FC = () => {
    const locales = useSupportedLocales()
    const helpCenter = useCurrentHelpCenter()
    const { savePreferences, canSavePreferences } =
        useHelpCenterPreferencesSettings()

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            showLanguageSelector
            onSaveChanges={savePreferences}
            isDirty={canSavePreferences}
            isConnectStoreLinkEnabled={false}
        >
            <section className={css.container}>
                <div className={css.title}>
                    <h3>Languages</h3>
                    <p>
                        Select the languages in which you will be able to edit
                        and customize your Help Center.
                    </p>
                </div>
                <AvailableLanguagesTags availableLocales={locales} />
                <DefaultLanguageSelect />
            </section>
            <SEO helpCenter={helpCenter} />
            <FooterActions />
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterPreferencesView
