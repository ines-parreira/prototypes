import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import {
    CONTACT_FORM_ABOUT_PATH,
    CONTACT_FORM_CREATE_PATH,
    CONTACT_FORM_FORMS_PATH,
} from 'pages/settings/contactForm/constants'
import { CONTACT_FORM_APP_DETAIL } from 'pages/settings/contactForm/views/ContactFormStartView/constants'
import ContactFormStartView from 'pages/settings/contactForm/views/ContactFormStartView/ContactFormStartView'
import { HELP_CENTER_BASE_PATH } from 'pages/settings/helpCenter/constants'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { buildSDKMocks } from '../../../../../../rest_api/help_center_api/tests/buildSdkMocks'
import { mockQueryClient } from '../../../../../../tests/reactQueryTestingUtils'
import { mockResourceServerReplies } from '../../../tests/resource-mocks'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const mockedUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const testQueryClient = mockQueryClient()

const mockedLocales = [
    { name: 'English', code: 'en-US' },
    { name: 'Spanish', code: 'es-ES' },
    { name: 'French', code: 'fr-FR' },
    { name: 'German', code: 'de-DE' },
]

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: () => mockedLocales,
}))

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

describe('<ContactFormStartView />', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        // clearing the cache is better than using invalidateQueries because it has no effect
        // on hooks using the `enabled` option
        // cf. https://stackoverflow.com/questions/68577988/invalidate-queries-doesnt-work-react-query
        testQueryClient.clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    describe('Navigation', () => {
        it('should display Navigation bar links correctly', () => {
            renderWithRouter(
                <QueryClientProvider client={testQueryClient}>
                    <Provider store={mockStore({})}>
                        <ContactFormStartView />
                    </Provider>
                </QueryClientProvider>,
            )

            const aboutNavLink = screen.getByRole('link', { name: 'About' })
            const formsNavLink = screen.getByRole('link', { name: 'Forms' })

            expect(aboutNavLink).toHaveAttribute(
                'href',
                CONTACT_FORM_ABOUT_PATH,
            )
            expect(formsNavLink).toHaveAttribute(
                'href',
                CONTACT_FORM_FORMS_PATH,
            )
        })

        it('should navigate to `About` section when there is no created CFs', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer, {
                getContactForms: 'success-empty',
            })

            const history = createMemoryHistory({
                initialEntries: [HELP_CENTER_BASE_PATH],
            })

            renderWithRouter(
                <QueryClientProvider client={testQueryClient}>
                    <Provider store={mockStore({})}>
                        <ContactFormStartView />
                    </Provider>
                </QueryClientProvider>,
                { history },
            )

            await waitFor(() => {
                expect(history.location.pathname).toEqual(
                    CONTACT_FORM_ABOUT_PATH,
                )
            })
        })

        it('should navigate to `Forms` section when there is at least 1 created CF', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer, {
                getContactForms: 'success',
            })
            const history = createMemoryHistory({
                initialEntries: [HELP_CENTER_BASE_PATH],
            })

            renderWithRouter(
                <QueryClientProvider client={testQueryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <ContactFormStartView />,
                    </Provider>
                </QueryClientProvider>,
                { history },
            )

            await waitFor(() => {
                expect(history.location.pathname).toEqual(
                    CONTACT_FORM_FORMS_PATH,
                )
            })
        })
    })

    describe('`About` section', () => {
        it('should display description', () => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={testQueryClient}>
                    <Provider store={mockStore({})}>
                        <ContactFormStartView />,
                    </Provider>
                </QueryClientProvider>,

                {
                    route: CONTACT_FORM_ABOUT_PATH,
                },
            )

            screen.getByText(CONTACT_FORM_APP_DETAIL.description)

            expect(container).toMatchSnapshot()
        })

        it('should display `Create Contact Form` button', () => {
            renderWithRouter(
                <QueryClientProvider client={testQueryClient}>
                    <Provider store={mockStore({})}>
                        <ContactFormStartView />,
                    </Provider>
                </QueryClientProvider>,

                {
                    route: CONTACT_FORM_ABOUT_PATH,
                },
            )

            const createButtonHref = screen
                .getByRole('button', { name: /Create Contact Form/ })
                .closest('a')
                ?.getAttribute('to')

            expect(createButtonHref).toMatch(`${CONTACT_FORM_CREATE_PATH}`)
        })
    })

    describe('`Forms` section', () => {
        it('should redirect to the About page if fetching failed with an error', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer, {
                getContactForms: 'error',
            })

            const history = createMemoryHistory({
                initialEntries: [CONTACT_FORM_FORMS_PATH],
            })

            renderWithRouter(
                <QueryClientProvider client={testQueryClient}>
                    <Provider store={mockStore({})}>
                        <ContactFormStartView />,
                    </Provider>
                </QueryClientProvider>,
                { history },
            )

            await waitFor(() => {
                expect(history.location.pathname).toEqual(
                    CONTACT_FORM_ABOUT_PATH,
                )
            })
        })

        it('should render ManageContactForms component empty state', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer, {
                getContactForms: 'success-empty',
            })

            renderWithRouter(
                <QueryClientProvider client={testQueryClient}>
                    <Provider store={mockStore({})}>
                        <ContactFormStartView />,
                    </Provider>
                </QueryClientProvider>,
                { route: CONTACT_FORM_FORMS_PATH },
            )

            await waitFor(() => {
                screen.getByText('You have no contact forms at the moment.')
            })
        })

        it('should display `Create Form` button in the container when there is no forms', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer, {
                getContactForms: 'success-empty',
            })

            const history = createMemoryHistory({
                initialEntries: [CONTACT_FORM_FORMS_PATH],
            })

            jest.spyOn(history, 'push')

            renderWithRouter(
                <QueryClientProvider client={testQueryClient}>
                    <Provider store={mockStore({})}>
                        <ContactFormStartView />
                    </Provider>
                </QueryClientProvider>,
                { history },
            )

            await waitFor(() => {
                const createButton = screen.getByLabelText('create-form-bottom')
                fireEvent.click(createButton)
            })

            expect(history.push).toHaveBeenLastCalledWith(
                CONTACT_FORM_CREATE_PATH,
            )
        })

        it('should display `Create Form` button in the header when there is at least one form', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer)

            const history = createMemoryHistory({
                initialEntries: [CONTACT_FORM_FORMS_PATH],
            })

            jest.spyOn(history, 'push')

            renderWithRouter(
                <QueryClientProvider client={testQueryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <ContactFormStartView />,
                    </Provider>
                </QueryClientProvider>,
                { history },
            )

            await waitFor(() => {
                const createButton = screen.getByLabelText('create-form-nav')
                fireEvent.click(createButton)
            })

            expect(history.push).toHaveBeenLastCalledWith(
                CONTACT_FORM_CREATE_PATH,
            )
        })
    })
})
