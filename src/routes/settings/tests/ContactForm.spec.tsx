import {render} from '@testing-library/react'
import React from 'react'
import {Route} from 'react-router-dom'

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
import {HelpCenterApiClientProvider} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {SupportedLocalesProvider} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {assumeMock} from 'utils/testing'

import {ContactForm} from '../ContactForm'
import {renderAppSettings} from '../helpers/settingsRenderer'

jest.mock('react-router-dom', () => ({
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({children}) => <div>{children}</div>),
    Link: () => <div />,
}))
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    HelpCenterApiClientProvider: jest.fn(({children}) => <div>{children}</div>),
}))
jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    SupportedLocalesProvider: jest.fn(({children}) => <div>{children}</div>),
}))

const ComponentToRender = () => <div>OK</div>
jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn(() => ComponentToRender),
}))

const mockedRoute = Route as jest.Mock
const mockedRenderAppSettings = assumeMock(renderAppSettings)

describe('ContactForm', () => {
    it('should call HelpCenterApiClientProvider and SupportedLocalesProvider', () => {
        render(<ContactForm />)

        expect(HelpCenterApiClientProvider).toHaveBeenCalled()
        expect(SupportedLocalesProvider).toHaveBeenCalled()
    })

    it.each([
        [
            {
                callOrder: 0,
                exact: true,
                path: [
                    CONTACT_FORM_BASE_PATH,
                    CONTACT_FORM_ABOUT_PATH,
                    CONTACT_FORM_FORMS_PATH,
                ],
                component: ContactFormStartView,
            },
        ],
        [
            {
                callOrder: 1,
                exact: true,
                path: CONTACT_FORM_CREATE_PATH,
                component: ContactFormCreateView,
            },
        ],
        [
            {
                callOrder: 2,
                exact: undefined,
                path: CONTACT_FORM_SETTINGS_PATH,
                component: ContactFormSettingsView,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({callOrder, exact, path, component}) => {
            render(<ContactForm />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
            ])
            expect(mockedRoute.mock.calls[callOrder]).toEqual([
                {
                    path,
                    exact,
                    children: ComponentToRender,
                },
                {},
            ])
        }
    )
})
