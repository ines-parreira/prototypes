import React, {useEffect} from 'react'
import classNames from 'classnames'
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
import {useHelpCenterIdParam} from '../../hooks/useHelpCenterIdParam'
import {useLocales} from '../../hooks/useLocales'
import {HelpCenterPreferencesSettings} from '../../providers/HelpCenterPreferencesSettings'
import {HelpCenterDetailsBreadcrumb} from '../HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from '../HelpCenterNavigation'

import {AvailableLanguagesTags} from './components/AvailableLanguagesTags'
import {DefaultLanguageSelect} from './components/DefaultLanguageSelect'
import {DisplayName} from './components/DisplayName'
import {FooterActions} from './components/FooterActions'
import {SEO} from './components/SEO'

import css from './HelpCenterPreferencesView.less'

export const HelpCenterPreferencesView: React.FC = () => {
    const dispatch = useAppDispatch()
    const locales = useLocales()
    const helpCenterId = useHelpCenterIdParam()
    const {
        helpCenter,
        getHelpCenterCustomDomain,
        fetchHelpCenterTranslations,
    } = useCurrentHelpCenter()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const handleOnChangeLocale = (locale: LocaleCode) => {
        dispatch(changeViewLanguage(locale))
    }

    useEffect(() => {
        void getHelpCenterCustomDomain()
        void fetchHelpCenterTranslations()
    }, [helpCenter !== null])

    useEffect(() => {
        if (helpCenter?.supported_locales) {
            void fetchHelpCenterTranslations()
        }
    }, [helpCenter?.supported_locales])

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
            <HelpCenterNavigation helpCenterId={helpCenterId} />
            <HelpCenterPreferencesSettings helpCenterId={helpCenterId}>
                <Container
                    fluid
                    className={classNames('page-container', css.container)}
                >
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
                </Container>
            </HelpCenterPreferencesSettings>
        </div>
    )
}

export default HelpCenterPreferencesView
