import React, {useEffect} from 'react'
import {useSelector} from 'react-redux'
import {Container} from 'reactstrap'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {LocaleCode} from '../../../../../models/helpCenter/types'
import {
    changeViewLanguage,
    getViewLanguage,
} from '../../../../../state/helpCenter/ui'
import Loader from '../../../../common/components/Loader/Loader'
import PageHeader from '../../../../common/components/PageHeader'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import {useCurrentHelpCenter} from '../../hooks/useCurrentHelpCenter'
import {useLocales} from '../../hooks/useLocales'
import {HelpCenterPreferencesSettings} from '../../providers/HelpCenterPreferencesSettings'
import {HelpCenterDetailsBreadcrumb} from '../HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from '../HelpCenterNavigation'
import {PageContainer} from '../PageContainer'

import {AvailableLanguagesTags} from './components/AvailableLanguagesTags'
import {DefaultLanguageSelect} from './components/DefaultLanguageSelect'
import {DisplayName} from './components/DisplayName'
import {FooterActions} from './components/FooterActions'
import {SEO} from './components/SEO'

export const HelpCenterPreferencesView: React.FC = () => {
    const dispatch = useAppDispatch()
    const locales = useLocales()
    const {helpCenter, getHelpCenterCustomDomain} = useCurrentHelpCenter()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const handleOnChangeLocale = (locale: LocaleCode) => {
        dispatch(changeViewLanguage(locale))
    }

    useEffect(() => {
        void getHelpCenterCustomDomain()
    }, [helpCenter !== null])

    if (!helpCenter) {
        return (
            <Container fluid className="page-container">
                <Loader />
            </Container>
        )
    }

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
                <PageContainer>
                    <DisplayName />
                    <section>
                        <h3>Languages</h3>
                        <DefaultLanguageSelect availableLocales={locales} />
                        <AvailableLanguagesTags availableLocales={locales} />
                    </section>
                    <SEO
                        helpCenter={helpCenter}
                        availableLocales={locales}
                        viewLanguage={viewLanguage}
                        onChangeLocale={handleOnChangeLocale}
                    />
                    <FooterActions />
                </PageContainer>
            </HelpCenterPreferencesSettings>
        </div>
    )
}

export default HelpCenterPreferencesView
