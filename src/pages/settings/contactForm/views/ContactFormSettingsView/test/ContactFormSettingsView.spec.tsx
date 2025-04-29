import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import useContactFormAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import {
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_CUSTOMIZATION_PATH,
    CONTACT_FORM_PREFERENCES_PATH,
    CONTACT_FORM_PUBLISH_PATH,
    CONTACT_FORM_SETTINGS_PATH,
} from 'pages/settings/contactForm/constants'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { insertContactFormIdParam } from 'pages/settings/contactForm/utils/navigation'
import ContactFormSettingsView from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormSettingsView'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { getHasAutomate } from 'state/billing/selectors'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('state/billing/selectors', () => ({
    ...jest.requireActual('state/billing/selectors'),
    __esModule: true,
    getHasAutomate: jest.fn(),
}))

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
jest.mock('pages/automate/common/hooks/useContactFormAutomationSettings')

const queryClient = mockQueryClient()

jest.mock('launchdarkly-react-client-sdk')

const mockGetHasAutomate = getHasAutomate as jest.MockedFunction<
    typeof getHasAutomate
>

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
            },
        )
    }

    beforeEach(() => {
        jest.resetAllMocks()
        jest.mocked(useSupportedLocales).mockReturnValue(
            getLocalesResponseFixture,
        )
        jest.mocked(useContactFormAutomationSettings).mockReturnValue({
            automationSettings: {
                order_management: {
                    enabled: true,
                },
                workflows: [],
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleContactFormAutomationSettingsFetch: jest.fn(),
            handleContactFormAutomationSettingsUpdate: jest.fn(),
        })
        jest.spyOn(LD, 'useFlags').mockReturnValue({})
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
            insertContactFormIdParam(CONTACT_FORM_CUSTOMIZATION_PATH, FORM_ID),
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
        },
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
                CONTACT_FORM_BASE_PATH,
            )
        },
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

    it('should display "Automate" tab', () => {
        const history = createMemoryHistory({
            initialEntries: [
                insertContactFormIdParam(CONTACT_FORM_SETTINGS_PATH, FORM_ID),
            ],
        })

        mockGetHasAutomate.mockReturnValue(true)

        renderView({
            path: CONTACT_FORM_SETTINGS_PATH,
            history,
        })

        expect(
            screen.getByRole('link', { name: /Automate/i }),
        ).toBeInTheDocument()
    })

    it('should hide the "Automate" tab', () => {
        const history = createMemoryHistory({
            initialEntries: [
                insertContactFormIdParam(CONTACT_FORM_SETTINGS_PATH, FORM_ID),
            ],
        })

        mockGetHasAutomate.mockReturnValue(false)

        renderView({
            path: CONTACT_FORM_SETTINGS_PATH,
            history,
        })

        expect(
            screen.queryByRole('link', { name: /Automate/i }),
        ).not.toBeInTheDocument()
    })
})
