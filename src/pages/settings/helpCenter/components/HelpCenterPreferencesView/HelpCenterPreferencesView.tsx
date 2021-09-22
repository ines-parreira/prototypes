import React from 'react'
import {useSelector} from 'react-redux'
import {Container} from 'reactstrap'

import {getCurrentHelpCenter} from '../../../../../state/entities/helpCenters/selectors'

import Loader from '../../../../common/components/Loader/Loader'
import PageHeader from '../../../../common/components/PageHeader'

import {LanguagePreferencesSettings} from '../../providers/LanguagePreferencesSettings'
import {useHelpCenterIdParam} from '../../hooks/useHelpCenterIdParam'
import {useLocales} from '../../hooks/useLocales'

import {HelpCenterNavigation} from '../HelpCenterNavigation'
import {HelpCenterDetailsBreadcrumb} from '../HelpCenterDetailsBreadcrumb'
import {DefaultLanguageSelect} from '../DefaultLanguageSelect'

import {AvailableLanguagesTags} from './components/AvailableLanguagesTags'

import {FooterActions} from './components/FooterActions'
import {DisplayName} from './components/DisplayName'

export const HelpCenterPreferencesView = () => {
    const helpcenterId = useHelpCenterIdParam()
    const locales = useLocales()
    const helpCenter = useSelector(getCurrentHelpCenter)

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
                        helpcenterName={helpCenter.name}
                        activeLabel="Preferences"
                    />
                }
            />
            <HelpCenterNavigation helpcenterId={helpcenterId} />
            <LanguagePreferencesSettings
                defaultLocale={helpCenter.default_locale}
                availableLocales={helpCenter.supported_locales}
                helpcenterId={helpcenterId}
            >
                <Container
                    fluid
                    className="page-container"
                    style={{maxWidth: 680, marginLeft: 0}}
                >
                    <DisplayName />
                    <DefaultLanguageSelect localesAvailable={locales} />
                    <AvailableLanguagesTags availableLocales={locales} />
                    <FooterActions />
                </Container>
            </LanguagePreferencesSettings>
        </div>
    )
}

export default HelpCenterPreferencesView
