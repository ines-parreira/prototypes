import React from 'react'
import {useSelector} from 'react-redux'
import {Container} from 'reactstrap'

import {readHelpcenterById} from '../../../../../state/entities/helpCenters/selectors'

import PageHeader from '../../../../common/components/PageHeader'

import {LanguagePreferencesSettings} from '../../providers/LanguagePreferencesSettings'
import {useHelpCenterIdParam} from '../../hooks/useHelpCenterIdParam'
import {useLocales} from '../../hooks/useLocales'

import {HelpCenterNavigation} from '../HelpCenterNavigation'
import {HelpCenterDetailsBreadcrumb} from '../HelpCenterDetailsBreadcrumb'
import {DefaultLanguageSelect} from '../DefaultLanguageSelect'

import {AvailableLanguagesTags} from './components/AvailableLanguagesTags'

import {FooterActions} from './components/FooterActions'

export const HelpCenterPreferencesView = () => {
    const helpcenterId = useHelpCenterIdParam()
    const locales = useLocales()
    const data = useSelector(readHelpcenterById(helpcenterId.toString()))

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpcenterName={data.name}
                        activeLabel="Preferences"
                    />
                }
            />
            <HelpCenterNavigation helpcenterId={helpcenterId} />
            <LanguagePreferencesSettings
                defaultLocale={data.default_locale}
                availableLocales={data.supported_locales}
                helpcenterId={helpcenterId}
            >
                <Container
                    fluid
                    className="page-container"
                    style={{maxWidth: 680, marginLeft: 0}}
                >
                    <DefaultLanguageSelect localesAvailable={locales} />
                    <AvailableLanguagesTags availableLocales={locales} />
                    <FooterActions />
                </Container>
            </LanguagePreferencesSettings>
        </div>
    )
}

export default HelpCenterPreferencesView
