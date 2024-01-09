import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'
import {GmailIntegration, IntegrationType} from 'models/integration/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import ContactFormMailtoReplacementSection from '../ContactFormMailtoReplacementSection'
import {useEmailIntegrations} from '../../../hooks/useEmailIntegrations'

jest.mock('../../../hooks/useEmailIntegrations', () => ({
    useEmailIntegrations: jest.fn(),
}))
jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => Promise.resolve()),
}))

const CONTACT_FORM_ID = 1

const mockUseEmailIntegrations = jest.mocked(useEmailIntegrations)
const mockStore = configureMockStore([thunk])()
const queryClient = mockQueryClient()

const createGmailIntegration = (id: number, email: string): GmailIntegration =>
    ({
        type: IntegrationType.Gmail,
        id,
        name: email,
        meta: {address: email},
    } as GmailIntegration)

const renderComponent = () => {
    render(
        <Provider store={mockStore}>
            <QueryClientProvider client={queryClient}>
                <ContactFormMailtoReplacementSection
                    contactFormId={CONTACT_FORM_ID}
                />
            </QueryClientProvider>
        </Provider>
    )
}
describe('<ContactFormMailtoReplacementSection />', () => {
    beforeEach(() => {
        mockUseEmailIntegrations.mockReturnValue({
            defaultIntegration: undefined,
            emailIntegrations: [],
        })
        queryClient.clear()
    })
    it('should render component', () => {
        renderComponent()

        expect(screen.getByText('Replace email links')).toBeInTheDocument()
    })

    it('should hide alert after we close it', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Pages with iFrames, tables, or dynamic content may require manual replacement.'
            )
        ).toBeInTheDocument()

        userEvent.click(screen.getByLabelText('Close Icon'))

        expect(
            screen.queryByText(
                'Pages with iFrames, tables, or dynamic content may require manual replacement.'
            )
        ).not.toBeInTheDocument()
    })

    it('should hide button and show empty state when no email integration', () => {
        renderComponent()

        expect(screen.getByText('No links detected')).toBeInTheDocument()
        expect(screen.queryByText('Replace links')).not.toBeInTheDocument()
    })

    describe('when email integration no empty', () => {
        const testEmails = [
            createGmailIntegration(1, 'test1@mail.com'),
            createGmailIntegration(2, 'test2@mail.com'),
        ]
        beforeEach(() => {
            mockUseEmailIntegrations.mockReturnValue({
                defaultIntegration: undefined,
                emailIntegrations: testEmails,
            })
        })

        it('should show button and list of emails selected by default', () => {
            renderComponent()

            expect(
                screen.queryByText('No links detected')
            ).not.toBeInTheDocument()
            expect(screen.getByText('Replace links')).toBeInTheDocument()

            testEmails.map((email) => {
                expect(screen.getByLabelText(email.name)).toBeChecked()
            })
        })

        it('should unselect checkbox when clicked', () => {
            renderComponent()

            const email = testEmails[0].name

            expect(screen.getByLabelText(email)).toBeChecked()

            userEvent.click(screen.getByLabelText(email))

            expect(screen.getByLabelText(email)).not.toBeChecked()
        })

        it('should move replaced emails to replaced section', async () => {
            renderComponent()

            const email = testEmails[0].name

            expect(
                screen.getByTestId(`email-detected-${email}`)
            ).toBeInTheDocument()

            userEvent.click(screen.getByText('Replace links'))

            await waitFor(() =>
                expect(
                    screen.getByTestId(`email-replaced-${email}`)
                ).toBeInTheDocument()
            )

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    message: 'Replaced with link to Contact Form.',
                    status: NotificationStatus.Success,
                })
            })
        })

        it('should move replaced emails to detected section if when revert', async () => {
            renderComponent()

            const email = testEmails[0].name

            expect(
                screen.getByTestId(`email-detected-${email}`)
            ).toBeInTheDocument()

            userEvent.click(screen.getByText('Replace links'))

            await waitFor(() =>
                expect(
                    screen.getByTestId(`email-replaced-${email}`)
                ).toBeInTheDocument()
            )

            userEvent.click(screen.getByTestId(`revert-email-${email}`))

            await waitFor(() =>
                expect(
                    screen.getByTestId(`email-detected-${email}`)
                ).toBeInTheDocument()
            )
            expect(screen.getByLabelText(email)).toBeChecked()
            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    message: 'Replaced with link to Contact Form.',
                    status: NotificationStatus.Success,
                })
            })
        })

        it('should add email to the replaced list if one email already replaced', async () => {
            renderComponent()

            const email1 = testEmails[0].name
            const email2 = testEmails[1].name

            // Unselect 2nd email
            userEvent.click(screen.getByLabelText(email2))

            userEvent.click(screen.getByText('Replace links'))

            // Check only 1st email is replaced
            await waitFor(() =>
                expect(
                    screen.getByTestId(`email-replaced-${email1}`)
                ).toBeInTheDocument()
            )

            expect(
                screen.getByTestId(`email-detected-${email2}`)
            ).toBeInTheDocument()

            // Select 2nd email
            userEvent.click(screen.getByLabelText(email2))

            userEvent.click(screen.getByText('Replace links'))

            await waitFor(() =>
                expect(
                    screen.getByTestId(`email-replaced-${email1}`)
                ).toBeInTheDocument()
            )
            expect(
                screen.getByTestId(`email-replaced-${email2}`)
            ).toBeInTheDocument()
        })

        it('should remove replaced email section when no email replaced', async () => {
            const testEmail = createGmailIntegration(1, 'test1@mail.com')
            mockUseEmailIntegrations.mockReturnValue({
                defaultIntegration: undefined,
                emailIntegrations: [testEmail],
            })

            renderComponent()

            const email = testEmail.name

            userEvent.click(screen.getByText('Replace links'))

            await waitFor(() =>
                expect(
                    screen.getByTestId(`email-replaced-${email}`)
                ).toBeInTheDocument()
            )
            expect(
                screen.queryByText('Email links replaced')
            ).toBeInTheDocument()

            userEvent.click(screen.getByTestId(`revert-email-${email}`))

            await waitFor(() =>
                expect(
                    screen.getByTestId(`email-detected-${email}`)
                ).toBeInTheDocument()
            )
            expect(
                screen.queryByText('Email links replaced')
            ).not.toBeInTheDocument()
        })
    })
})
