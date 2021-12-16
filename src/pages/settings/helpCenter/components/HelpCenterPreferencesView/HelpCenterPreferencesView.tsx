import React, {useEffect} from 'react'
import {useSelector} from 'react-redux'
import {Container} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import {LocaleCode} from 'models/helpCenter/types'
import {changeViewLanguage, getViewLanguage} from 'state/helpCenter/ui'

import PageHeader from '../../../../common/components/PageHeader'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import {useHelpCenterActions} from '../../hooks/useHelpCenterActions'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import {HelpCenterPreferencesSettings} from '../../providers/HelpCenterPreferencesSettings'
import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {HelpCenterDetailsBreadcrumb} from '../HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from '../HelpCenterNavigation'
import settingsCss from '../../../settings.less'

import {AvailableLanguagesTags} from './components/AvailableLanguagesTags'
import {DefaultLanguageSelect} from './components/DefaultLanguageSelect'
import {DisplayName} from './components/DisplayName'
import {FooterActions} from './components/FooterActions'
import {SEO} from './components/SEO'

export const HelpCenterPreferencesView: React.FC = () => {
    const dispatch = useAppDispatch()
    const locales = useSupportedLocales()
    const helpCenter = useCurrentHelpCenter()
    const {getHelpCenterCustomDomain} = useHelpCenterActions()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const handleOnChangeLocale = (locale: LocaleCode) => {
        dispatch(changeViewLanguage(locale))
    }

    useEffect(() => {
        void getHelpCenterCustomDomain()
    }, [])

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName={helpCenter.name}
                        activeLabel="Preferences"
                    />
                }
            />
            <HelpCenterNavigation helpCenterId={helpCenter.id} />
            <HelpCenterPreferencesSettings helpCenter={helpCenter}>
                <Container fluid className={settingsCss.pageContainer}>
                    <div className={settingsCss.contentWrapper}>
                        <DisplayName />
                        <section>
                            <h3>Languages</h3>
                            <DefaultLanguageSelect availableLocales={locales} />
                            <AvailableLanguagesTags
                                availableLocales={locales}
                            />
                        </section>
                        <SEO
                            helpCenter={helpCenter}
                            availableLocales={locales}
                            viewLanguage={viewLanguage}
                            onChangeLocale={handleOnChangeLocale}
                        />
                        <FooterActions />
                    </div>
                </Container>
            </HelpCenterPreferencesSettings>
        </div>
    )
}

export default HelpCenterPreferencesView
