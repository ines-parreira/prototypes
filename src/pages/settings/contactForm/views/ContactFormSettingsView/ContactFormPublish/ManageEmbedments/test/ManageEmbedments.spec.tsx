import React from 'react'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {screen} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import {RootState, StoreDispatch} from 'state/types'
import {integrationsState} from 'fixtures/integrations'
import {account as accountFixture} from 'fixtures/account'
import {renderWithRouter} from 'utils/testing'
import {CurrentContactFormContext} from 'pages/settings/contactForm/contexts/currentContactForm.context'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {CONTACT_FORM_PUBLISH_PATH} from 'pages/settings/contactForm/constants'
import ManageEmbedments from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPublish/ManageEmbedments/ManageEmbedments'
import {PageEmbedment} from 'models/contactForm/types'
import {PageEmbedmentPosition} from 'pages/settings/contactForm/components/PageEmbedmentForm'
import {SegmentEvent, logEvent} from 'store/middlewares/segmentTracker'
import {user as userFixture} from 'fixtures/users'

jest.mock('store/middlewares/segmentTracker')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const embedments: PageEmbedment[] = Array.from({length: 3}).map((_, i) => ({
    id: i,
    page_path_url: `/pages/test-${i}`,
    page_title: `Test ${i}`,
    page_external_id: (i + 1000).toString(),
    position: PageEmbedmentPosition.TOP,
    updated_datetime: '2021-01-01T00:00:00.000Z',
    created_datetime: '2021-01-01T00:00:00.000Z',
}))

const contactForm = {
    ...ContactFormFixture,
    shop_name: 'shop-name',
}

describe('ContactFormPublish', () => {
    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsState),
        currentAccount: fromJS(accountFixture),
        currentUser: fromJS(userFixture),
    }

    const queryClient = mockQueryClient()

    const renderView = ({
        state,
        path = CONTACT_FORM_PUBLISH_PATH,
        route = CONTACT_FORM_PUBLISH_PATH,
    }: {
        state: Partial<RootState>
        path?: string
        route?: string
    }) => {
        return renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <CurrentContactFormContext.Provider value={contactForm}>
                    <Provider store={mockStore(state)}>
                        <ManageEmbedments embedments={embedments} />,
                    </Provider>
                </CurrentContactFormContext.Provider>
            </QueryClientProvider>,
            {
                path,
                route,
            }
        )
    }

    it('wording check', () => {
        renderView({state: defaultState})

        screen.getByText('Manage embedded pages')
        screen.getByText(/Edit the position of the contact form/)
        screen.getByText(/Note: Manually embedded pages will/)
    })

    it('renders the embedments', () => {
        renderView({state: defaultState})

        embedments.forEach((embedment) => {
            // Renders the page title for each embedment
            screen.getByText(embedment.page_title)

            // Renders the delete button for each embedment
            screen.getByTestId(`delete-button-${embedment.id}`)

            // Renders the preview button for each embedment
            const link = screen.getByTestId(`preview-button-${embedment.id}`)
            expect(link).toHaveAttribute(
                'href',
                `https://${contactForm.shop_name}.myshopify.com${embedment.page_path_url}`
            )
        })
    })

    it('logs an event when trying to embed on another page', () => {
        renderView({state: defaultState})

        const button = screen.getByText(/embed on another page/i)

        userEvent.click(button)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.ContactFormAutoEmbedEmbedOnAnotherPageClicked,
            {
                user_id: userFixture.id,
                account_domain: accountFixture.domain,
                contact_form_id: contactForm.id,
                page_embedments_count: embedments.length,
            }
        )
    })
})
