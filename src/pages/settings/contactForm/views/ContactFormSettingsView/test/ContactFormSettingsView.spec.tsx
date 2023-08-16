import {screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import LD from 'launchdarkly-react-client-sdk'
import {QueryClientProvider} from '@tanstack/react-query'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import ContactFormSettingsView from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormSettingsView'
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import {
    CONTACT_FORM_CUSTOMIZATION_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_PREFERENCES_PATH,
    CONTACT_FORM_PUBLISH_PATH,
    CONTACT_FORM_SETTINGS_PATH,
} from 'pages/settings/contactForm/constants'
import {integrationsState} from 'fixtures/integrations'
import {account} from 'fixtures/account'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {billingState} from 'fixtures/billing'
import {FeatureFlagKey} from 'config/featureFlags'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')

const queryClient = createTestQueryClient()

describe('<ContactFormSettingsView />', () => {
    const FORM_ID = '1'
    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsState),
        billing: fromJS(billingState),
        currentAccount: fromJS(account),
        entities: {
            contactForm: {
                contactForms: {
                    contactFormById: {
                        [FORM_ID]: ContactFormFixture,
                    },
                },
            },
        } as any,
        ui: {
            contactForm: {
                currentId: Number(FORM_ID),
            },
        } as any,
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
            <QueryClientProvider client={queryClient}>
                <DndProvider backend={HTML5Backend}>
                    <Provider store={mockStore(state)}>
                        <ContactFormSettingsView />
                    </Provider>
                </DndProvider>
            </QueryClientProvider>,
            {
                path,
                history,
            }
        )
    }

    beforeEach(() => {
        jest.resetAllMocks()
        jest.mocked(useSupportedLocales).mockReturnValue(
            getLocalesResponseFixture
        )
        jest.spyOn(LD, 'useFlags').mockReturnValue({
            [FeatureFlagKey.NewBillingInterface]: true,
        })
    })

    it('should redirect to CUSTOMIZATION page if just form id provided', () => {
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
            insertContactFormIdParam(CONTACT_FORM_CUSTOMIZATION_PATH, FORM_ID)
        )
    })

    it.each([
        CONTACT_FORM_SETTINGS_PATH,
        CONTACT_FORM_PREFERENCES_PATH,
        CONTACT_FORM_CUSTOMIZATION_PATH,
        CONTACT_FORM_PUBLISH_PATH,
    ])(
        'should redirect to ABOUT page if contact form id is invalid for %p',
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

    it.each([
        CONTACT_FORM_CUSTOMIZATION_PATH,
        CONTACT_FORM_PREFERENCES_PATH,
        CONTACT_FORM_PUBLISH_PATH,
    ])(
        'should redirect to ABOUT page if the header `Contact Form` link was clicked',
        async (path) => {
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
        CONTACT_FORM_CUSTOMIZATION_PATH,
        CONTACT_FORM_PREFERENCES_PATH,
        CONTACT_FORM_PUBLISH_PATH,
    ])('should display preview button', async (path) => {
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
