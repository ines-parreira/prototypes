import React from 'react'

import {fromJS} from 'immutable'
import {render, waitFor} from '@testing-library/react'

import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'

import {renderWithRouter, assumeMock, mockStore} from 'utils/testing'
import {IntegrationType, EmailProvider} from 'models/integration/constants'
import EmailIntegrationList from '../EmailIntegrationList'
import {fetchEmailDomains} from '../resources'

jest.mock('../resources')
const fetchEmailDomainsMock = assumeMock(fetchEmailDomains)

describe('<EmailIntegrationList/>', () => {
    function getEmailIntegration(id: number) {
        return {
            id,
            type: IntegrationType.Email,
            name: `My Email Integration ${id}`,
            meta: {
                address: 'email@gorgias-test.com',
            },
        }
    }

    function getGmailIntegration(id: number, sendingEnabled: boolean) {
        return {
            id,
            type: IntegrationType.Gmail,
            name: `My GMail Integration ${id}`,
            meta: {
                address: 'email@gmail.com',
                enable_gmail_sending: sendingEnabled,
            },
        }
    }

    function getOutlookIntegration(id: number, sendingEnabled: boolean) {
        return {
            id,
            type: IntegrationType.Outlook,
            name: `My Outlook Integration ${id}`,
            meta: {
                address: 'email@Outlook.com',
                enable_gmail_sending: sendingEnabled,
            },
        }
    }

    const store = mockStore({} as any)
    const commonProps = {
        integrations: fromJS([getEmailIntegration(1)]),
        loading: fromJS({}),
        gmailRedirectUri: '',
        outlookRedirectUri: '',
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('render()', () => {
        it('should render the page with a warning when the domain is not verified', async () => {
            const get = fetchEmailDomainsMock.mockResolvedValueOnce([])

            const {container} = render(
                <Provider store={store}>
                    <EmailIntegrationList {...commonProps} />
                </Provider>,
                {
                    wrapper: ({children}) => (
                        <MemoryRouter>{children}</MemoryRouter>
                    ),
                }
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(container).toMatchSnapshot()
        })

        it('should render the page when there are no integrations', async () => {
            const get = fetchEmailDomainsMock.mockResolvedValueOnce([])

            const {container} = render(
                <Provider store={store}>
                    <EmailIntegrationList
                        {...commonProps}
                        integrations={fromJS([])}
                    />
                </Provider>,

                {
                    wrapper: ({children}) => (
                        <MemoryRouter>{children}</MemoryRouter>
                    ),
                }
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(container).toMatchSnapshot()
        })

        it('should render the page without warning when the email is verified', async () => {
            const get = fetchEmailDomainsMock.mockResolvedValueOnce([
                {
                    name: 'gorgias-test.com',
                    verified: true,
                    data: fromJS({
                        sending_dns_records: [
                            {
                                verified: true,
                                record_type: 'AA',
                                host: 'gorgias-test.com',
                                value: 'test',
                                current_values: ['test1', 'test2'],
                            },
                        ],
                    }),
                },
            ])

            const {container} = render(
                <Provider store={store}>
                    <EmailIntegrationList {...commonProps} />
                </Provider>,

                {
                    wrapper: ({children}) => (
                        <MemoryRouter>{children}</MemoryRouter>
                    ),
                }
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(container).toMatchSnapshot()
        })

        it('should render the page with a warning when a GMail integration has sending disabled', async () => {
            const get = fetchEmailDomainsMock.mockResolvedValueOnce([])

            const {container} = render(
                <Provider store={store}>
                    <EmailIntegrationList
                        {...commonProps}
                        integrations={fromJS([getGmailIntegration(1, false)])}
                    />
                </Provider>,

                {
                    wrapper: ({children}) => (
                        <MemoryRouter>{children}</MemoryRouter>
                    ),
                }
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(container).toMatchSnapshot()
        })

        it('should render the page with a warning when a Outlook integration has sending disabled', async () => {
            const get = fetchEmailDomainsMock.mockResolvedValueOnce([])

            const {container} = render(
                <Provider store={store}>
                    <EmailIntegrationList
                        {...commonProps}
                        integrations={fromJS([getOutlookIntegration(1, false)])}
                    />
                </Provider>,

                {
                    wrapper: ({children}) => (
                        <MemoryRouter>{children}</MemoryRouter>
                    ),
                }
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(container).toMatchSnapshot()
        })

        it('should render the page without warning when a GMail integration has sending enabled', async () => {
            const get = fetchEmailDomainsMock.mockResolvedValueOnce([])

            const {container} = render(
                <Provider store={store}>
                    <EmailIntegrationList
                        {...commonProps}
                        integrations={fromJS([getGmailIntegration(1, true)])}
                    />
                </Provider>,

                {
                    wrapper: ({children}) => (
                        <MemoryRouter>{children}</MemoryRouter>
                    ),
                }
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(container).toMatchSnapshot()
        })

        it('should redirect to preferences tab when provider is not Sendgrid', async () => {
            fetchEmailDomainsMock.mockResolvedValueOnce([])
            const integration = getEmailIntegration(1)

            const component = renderWithRouter(
                <Provider store={store}>
                    <EmailIntegrationList
                        {...commonProps}
                        integrations={fromJS([integration])}
                    />
                </Provider>
            )

            await component.findByTestId('integration-link')
            expect(
                component.getByTestId('integration-link').getAttribute('to')
            ).toBe(`/app/settings/channels/email/${integration.id}`)
        })

        it('should redirect to domain settings tab when provider is Sendgrid', async () => {
            fetchEmailDomainsMock.mockResolvedValueOnce([])
            const integration = getEmailIntegration(1)

            const component = renderWithRouter(
                <Provider store={store}>
                    <EmailIntegrationList
                        {...commonProps}
                        integrations={fromJS([
                            {
                                ...integration,
                                meta: {
                                    ...integration.meta,
                                    provider: EmailProvider.Sendgrid,
                                },
                            },
                        ])}
                    />
                </Provider>
            )

            await component.findByTestId('integration-link')
            expect(
                component.getByTestId('integration-link').getAttribute('to')
            ).toBe(
                `/app/settings/channels/email/${integration.id}/outbound-verification`
            )
        })
    })
})
