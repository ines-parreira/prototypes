import { Route, Switch } from 'react-router-dom'

import {
    CONTACT_FORM_ABOUT_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_CREATE_PATH,
    CONTACT_FORM_FORMS_PATH,
    CONTACT_FORM_SETTINGS_PATH,
} from 'pages/settings/contactForm/constants'
import ContactFormCreateView from 'pages/settings/contactForm/views/ContactFormCreateView'
import ContactFormSettingsView from 'pages/settings/contactForm/views/ContactFormSettingsView'
import ContactFormStartView from 'pages/settings/contactForm/views/ContactFormStartView'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'

import { renderAppSettings } from './helpers/settingsRenderer'

export function ContactForm() {
    return (
        <SupportedLocalesProvider>
            <Switch>
                <Route
                    exact
                    path={[
                        CONTACT_FORM_BASE_PATH,
                        CONTACT_FORM_ABOUT_PATH,
                        CONTACT_FORM_FORMS_PATH,
                    ]}
                >
                    {renderAppSettings(ContactFormStartView)}
                </Route>

                <Route exact path={CONTACT_FORM_CREATE_PATH}>
                    {renderAppSettings(ContactFormCreateView)}
                </Route>

                <Route path={CONTACT_FORM_SETTINGS_PATH}>
                    {renderAppSettings(ContactFormSettingsView)}
                </Route>
            </Switch>
        </SupportedLocalesProvider>
    )
}
