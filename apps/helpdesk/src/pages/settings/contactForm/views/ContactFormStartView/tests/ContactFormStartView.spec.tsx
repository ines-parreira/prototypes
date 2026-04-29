import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Route, Switch, useLocation } from 'react-router-dom'

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
import type { RootState } from 'state/types'

import { buildSDKMocks } from '../../../../../../rest_api/help_center_api/tests/buildSdkMocks'
import { mockQueryClient } from '../../../../../../tests/reactQueryTestingUtils'
import { mockResourceServerReplies } from '../../../tests/resource-mocks'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const mockedUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>
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
const LocationPath = () => {
    const location = useLocation()
    return <span data-testid="location-path">{location.pathname}</span>
}
const ContactFormRoutes = () => (
    <>
        <LocationPath />
        <Switch>
            <Route exact path={CONTACT_FORM_CREATE_PATH}>
                Create contact form route
            </Route>
            <Route>
                <ContactFormStartView />
            </Route>
        </Switch>
    </>
)
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
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getContactForms: 'success-empty',
        })
    })
    describe('Navigation', () => {
        it('should display Navigation bar links correctly', () => {
            render(<ContactFormStartView />, {
                storeState: {},
            })
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
            render(
                <>
                    <LocationPath />
                    <ContactFormStartView />
                </>,
                { initialEntries: [HELP_CENTER_BASE_PATH], storeState: {} },
            )
            await waitFor(() => {
                expect(screen.getByTestId('location-path')).toHaveTextContent(
                    CONTACT_FORM_ABOUT_PATH,
                )
            })
        })
        it('should navigate to `Forms` section when there is at least 1 created CF', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer, {
                getContactForms: 'success',
            })
            render(
                <>
                    <LocationPath />
                    <ContactFormStartView />
                </>,
                {
                    initialEntries: [HELP_CENTER_BASE_PATH],
                    storeState: defaultState,
                },
            )
            await waitFor(() => {
                expect(screen.getByTestId('location-path')).toHaveTextContent(
                    CONTACT_FORM_FORMS_PATH,
                )
            })
        })
    })
    describe('`About` section', () => {
        it('should display description', () => {
            const { container } = render(
                <>
                    <ContactFormStartView />,
                </>,
                { initialEntries: [CONTACT_FORM_ABOUT_PATH], storeState: {} },
            )
            screen.getByText(CONTACT_FORM_APP_DETAIL.description)
            expect(container).toMatchSnapshot()
        })
        it('should display `Create Contact Form` button', () => {
            render(
                <>
                    <ContactFormStartView />,
                </>,
                { initialEntries: [CONTACT_FORM_ABOUT_PATH], storeState: {} },
            )
            const createButtonHref = screen
                .getByRole('button', { name: /Create Contact Form/ })
                .closest('a')
                ?.getAttribute('href')
            expect(createButtonHref).toMatch(`${CONTACT_FORM_CREATE_PATH}`)
        })
    })
    describe('`Forms` section', () => {
        it('should redirect to the About page if fetching failed with an error', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer, {
                getContactForms: 'error',
            })
            render(
                <>
                    <LocationPath />
                    <ContactFormStartView />
                </>,
                { initialEntries: [CONTACT_FORM_FORMS_PATH], storeState: {} },
            )
            await waitFor(() => {
                expect(screen.getByTestId('location-path')).toHaveTextContent(
                    CONTACT_FORM_ABOUT_PATH,
                )
            })
        })
        it('should render ManageContactForms component empty state', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer, {
                getContactForms: 'success-empty',
            })
            render(
                <>
                    <ContactFormStartView />,
                </>,
                { initialEntries: [CONTACT_FORM_FORMS_PATH], storeState: {} },
            )
            await waitFor(() => {
                screen.getByText('You have no contact forms at the moment.')
            })
        })
        it('should display `Create Form` button in the container when there is no forms', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer, {
                getContactForms: 'success-empty',
            })
            render(<ContactFormRoutes />, {
                initialEntries: [CONTACT_FORM_FORMS_PATH],
                storeState: {},
            })
            await waitFor(() => {
                const createButton = screen.getByLabelText('create-form-bottom')
                fireEvent.click(createButton)
            })
            expect(screen.getByTestId('location-path')).toHaveTextContent(
                CONTACT_FORM_CREATE_PATH,
            )
        })
        it('should display `Create Form` button in the header when there is at least one form', async () => {
            mockResourceServerReplies(sdkMocks.mockedServer)
            render(<ContactFormRoutes />, {
                initialEntries: [CONTACT_FORM_FORMS_PATH],
                storeState: defaultState,
            })
            await waitFor(() => {
                const createButton = screen.getByLabelText('create-form-nav')
                fireEvent.click(createButton)
            })
            expect(screen.getByTestId('location-path')).toHaveTextContent(
                CONTACT_FORM_CREATE_PATH,
            )
        })
    })
})
