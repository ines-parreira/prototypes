import {fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {SupportedLocalesProvider} from 'pages/settings/helpCenter/providers/SupportedLocales'
import ContactFormSettingsView from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormSettingsView'
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import {
    CONTACT_FORM_APPEARANCE_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_PREFERENCES_PATH,
    CONTACT_FORM_PUBLISH_PATH,
    CONTACT_FORM_SETTINGS_PATH,
} from 'pages/settings/contactForm/constants'
import {integrationsState} from 'fixtures/integrations'
import {account} from 'fixtures/account'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<ContactFormSettingsView />', () => {
    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsState),
        currentAccount: fromJS(account),
    }

    const renderView = ({
        path,
        state = defaultState,
        history,
    }: {
        path: string
        history?: any
        state?: Partial<RootState>
    }) => {
        return renderWithRouter(
            <DndProvider backend={HTML5Backend}>
                <Provider store={mockStore(state)}>
                    <SupportedLocalesProvider>
                        <ContactFormSettingsView />
                    </SupportedLocalesProvider>
                </Provider>
            </DndProvider>,
            {
                path,
                history,
            }
        )
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should redirect to APPEARANCE page if just form id provided', () => {
        const FORM_ID = '99'
        const history = createMemoryHistory({
            initialEntries: [
                insertContactFormIdParam(CONTACT_FORM_SETTINGS_PATH, FORM_ID),
            ],
        })

        renderView({
            path: CONTACT_FORM_SETTINGS_PATH,
            history,
        })

        expect(history.location.pathname).toEqual(
            insertContactFormIdParam(CONTACT_FORM_APPEARANCE_PATH, FORM_ID)
        )
    })

    it.each([
        CONTACT_FORM_SETTINGS_PATH,
        CONTACT_FORM_PREFERENCES_PATH,
        CONTACT_FORM_APPEARANCE_PATH,
        CONTACT_FORM_PUBLISH_PATH,
    ])(
        'should redirect to ABOUT page if contact form id is invalid',
        (path) => {
            const INVALID_ID = 'invalid-number'
            const history = createMemoryHistory({
                initialEntries: [insertContactFormIdParam(path, INVALID_ID)],
            })

            renderView({
                path: CONTACT_FORM_SETTINGS_PATH,
                history,
            })

            expect(history.location.pathname).toEqual(CONTACT_FORM_BASE_PATH)
        }
    )

    it.each([CONTACT_FORM_APPEARANCE_PATH, CONTACT_FORM_PREFERENCES_PATH])(
        'should redirect to ABOUT page if there no changes and Cancel button was clicked',
        async (path) => {
            const FORM_ID = '99'
            const history = createMemoryHistory({
                initialEntries: [insertContactFormIdParam(path, FORM_ID)],
            })

            renderView({
                history,
                path: CONTACT_FORM_SETTINGS_PATH,
            })

            const cancelButton = await screen.findByRole('button', {
                name: 'Cancel',
            })
            fireEvent.click(cancelButton)

            expect(history.location.pathname).toEqual(CONTACT_FORM_BASE_PATH)
        }
    )

    it.each([
        CONTACT_FORM_APPEARANCE_PATH,
        CONTACT_FORM_PREFERENCES_PATH,
        CONTACT_FORM_PUBLISH_PATH,
    ])(
        'should redirect to ABOUT page if the header `Contact Form` link was clicked',
        async (path) => {
            const FORM_ID = '99'
            const history = createMemoryHistory({
                initialEntries: [insertContactFormIdParam(path, FORM_ID)],
            })

            renderView({
                path: CONTACT_FORM_SETTINGS_PATH,
                history,
            })

            const headerLink = await screen.findByLabelText('base-path')
            expect(headerLink.getAttribute('to')).toEqual(
                CONTACT_FORM_BASE_PATH
            )
        }
    )

    it.each([
        CONTACT_FORM_APPEARANCE_PATH,
        CONTACT_FORM_PREFERENCES_PATH,
        CONTACT_FORM_PUBLISH_PATH,
    ])('should display preview button', async (path) => {
        const FORM_ID = '99'
        const history = createMemoryHistory({
            initialEntries: [insertContactFormIdParam(path, FORM_ID)],
        })

        renderView({
            history,
            path: CONTACT_FORM_SETTINGS_PATH,
        })

        await screen.findByLabelText('contact form preview')
    })
})
