import {QueryClientProvider} from '@tanstack/react-query'
import {render, waitFor, screen, fireEvent} from '@testing-library/react'
import {List, fromJS} from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import React from 'react'

import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {IntegrationType, EmailProvider} from 'models/integration/constants'
import history from 'pages/history'
import {AccountSettingType} from 'state/currentAccount/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter, assumeMock, mockStore} from 'utils/testing'

import EmailIntegrationList from '../EmailIntegrationList'
import EmailIntegrationListVerificationStatus from '../EmailIntegrationListVerificationStatus'
import {fetchEmailDomains} from '../resources'

const queryClient = mockQueryClient()

jest.mock(
    'pages/integrations/integration/components/email/EmailIntegrationListVerificationStatus'
)

jest.mock('../resources')
jest.mock('pages/history')

const fetchEmailDomainsMock = assumeMock(fetchEmailDomains)
const EmailIntegrationListVerificationStatusMock = assumeMock(
    EmailIntegrationListVerificationStatus
)

describe('<EmailIntegrationList/>', () => {
    function getEmailIntegration(
        id: number,
        deactivated = false,
        provider = EmailProvider.Mailgun,
        address = 'email@gorgias-test.com'
    ) {
        return {
            id,
            type: IntegrationType.Email,
            ...(deactivated && {deactivated_datetime: '2024-01-01T00:00:00'}),
            name: `My Email Integration ${id}`,
            meta: {
                address,
                provider,
            },
        }
    }

    function getGmailIntegration(
        id: number,
        deactivated = false,
        sendingEnabled: boolean,
        provider = EmailProvider.Mailgun
    ) {
        return {
            id,
            type: IntegrationType.Gmail,
            ...(deactivated && {deactivated_datetime: '2024-01-01T00:00:00'}),
            name: `My GMail Integration ${id}`,
            meta: {
                address: 'email@gmail.com',
                enable_gmail_sending: sendingEnabled,
                provider: provider,
            },
        }
    }

    function getOutlookIntegration(
        id: number,
        deactivated = false,
        sendingEnabled: boolean,
        provider = EmailProvider.Mailgun
    ) {
        return {
            id,
            type: IntegrationType.Outlook,
            ...(deactivated && {deactivated_datetime: '2024-01-01T00:00:00'}),
            name: `My Outlook Integration ${id}`,
            meta: {
                address: 'email@Outlook.com',
                enable_gmail_sending: sendingEnabled,
                provider: provider,
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
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.EnableEmailToStoreMapping]: false,
            [FeatureFlagKey.DefaultEmailAddress]: false,
        }))
        EmailIntegrationListVerificationStatusMock.mockImplementation(() => (
            <div>EmailIntegrationListVerificationStatus</div>
        ))
    })

    describe('render()', () => {
        it('should render the page with a warning when the domain is not verified', async () => {
            const get = fetchEmailDomainsMock.mockResolvedValueOnce([])

            renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <EmailIntegrationList {...commonProps} />
                    </Provider>
                </QueryClientProvider>
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(
                EmailIntegrationListVerificationStatusMock
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDomainVerificationWarningVisible: true,
                }),
                {}
            )
        })

        it('should render the page with an alert when there are unverified integrations', async () => {
            window.GORGIAS_STATE = {
                integrations: {
                    authentication: {
                        email: {
                            forwarding_email_address: 'gorgias.com',
                        },
                    },
                },
            } as any

            const get = fetchEmailDomainsMock.mockResolvedValueOnce([
                {
                    name: 'gorgias-test.com',
                    verified: false,
                    data: fromJS({
                        sending_dns_records: [],
                    }),
                },
            ])

            renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <EmailIntegrationList
                            {...commonProps}
                            integrations={fromJS([
                                ...(
                                    commonProps.integrations as List<any>
                                ).toJS(),
                                getEmailIntegration(
                                    2,
                                    false,
                                    EmailProvider.Sendgrid,
                                    'base-email-integration@gorgias.com'
                                ),
                            ])}
                        />
                    </Provider>
                </QueryClientProvider>
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

            expect(
                screen.getByText(
                    'In order to verify your domains, click on the emails',
                    {exact: false}
                )
            ).toBeVisible()
        })

        it('should render the alert when there is just the base email integration', async () => {
            window.GORGIAS_STATE = {
                integrations: {
                    authentication: {
                        email: {
                            forwarding_email_address: 'gorgias.com',
                        },
                    },
                },
            } as any

            const get = fetchEmailDomainsMock.mockResolvedValueOnce([
                {
                    name: 'gorgias-test.com',
                    verified: false,
                    data: fromJS({
                        sending_dns_records: [],
                    }),
                },
            ])

            renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <EmailIntegrationList
                            {...commonProps}
                            integrations={fromJS([
                                getEmailIntegration(
                                    2,
                                    false,
                                    EmailProvider.Sendgrid,
                                    'base-email-integration@gorgias.com'
                                ),
                            ])}
                        />
                    </Provider>
                </QueryClientProvider>
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))
            expect(
                screen.queryByText(
                    'In order to verify your domains, click on the emails',
                    {exact: false}
                )
            ).not.toBeInTheDocument()
        })

        it('should render the default badge if an integration is set as default', async () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.EnableEmailToStoreMapping]: false,
                [FeatureFlagKey.DefaultEmailAddress]: true,
            }))

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
            const store = mockStore({
                currentAccount: fromJS({
                    settings: [
                        {
                            id: 1,
                            type: AccountSettingType.DefaultIntegration,
                            data: {
                                email: 1,
                            },
                        },
                    ],
                }),
            } as any)
            render(
                <Provider store={store}>
                    <EmailIntegrationList {...commonProps} />
                </Provider>,

                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            <MemoryRouter>{children}</MemoryRouter>
                        </QueryClientProvider>
                    ),
                }
            )
            await waitFor(() => expect(get).toHaveBeenCalledTimes(1))
            expect(screen.getByText('DEFAULT')).toBeInTheDocument()
        })

        it.each([EmailProvider.Mailgun, EmailProvider.Sendgrid])(
            'should render the page with a warning when a GMail integration has sending disabled',
            async (emailProvider: EmailProvider) => {
                const get = fetchEmailDomainsMock.mockResolvedValueOnce([])

                renderWithRouter(
                    <QueryClientProvider client={queryClient}>
                        <Provider store={store}>
                            <EmailIntegrationList
                                {...commonProps}
                                integrations={fromJS([
                                    getGmailIntegration(
                                        1,
                                        false,
                                        false,
                                        emailProvider
                                    ),
                                ])}
                            />
                        </Provider>
                    </QueryClientProvider>
                )
                await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

                expect(
                    EmailIntegrationListVerificationStatusMock
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        isDomainVerificationWarningVisible: true,
                        isForwardEmail: false,
                    }),
                    {}
                )
            }
        )

        it.each([EmailProvider.Mailgun, EmailProvider.Sendgrid])(
            'should render the page with a warning when an Outlook integration has sending disabled',
            async (emailProvider: EmailProvider) => {
                const get = fetchEmailDomainsMock.mockResolvedValueOnce([])

                renderWithRouter(
                    <QueryClientProvider client={queryClient}>
                        <Provider store={store}>
                            <EmailIntegrationList
                                {...commonProps}
                                integrations={fromJS([
                                    getOutlookIntegration(
                                        1,
                                        false,
                                        false,
                                        emailProvider
                                    ),
                                ])}
                            />
                        </Provider>
                    </QueryClientProvider>
                )
                await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

                expect(
                    EmailIntegrationListVerificationStatusMock
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        isDomainVerificationWarningVisible: true,
                        isForwardEmail: false,
                    }),
                    {}
                )
            }
        )

        it.each([EmailProvider.Mailgun, EmailProvider.Sendgrid])(
            'should render the page without warning when a GMail integration is deactivated',
            async (emailProvider: EmailProvider) => {
                const get = fetchEmailDomainsMock.mockResolvedValueOnce([])

                renderWithRouter(
                    <QueryClientProvider client={queryClient}>
                        <Provider store={store}>
                            <EmailIntegrationList
                                {...commonProps}
                                integrations={fromJS([
                                    getGmailIntegration(
                                        1,
                                        true,
                                        true,
                                        emailProvider
                                    ),
                                ])}
                            />
                        </Provider>
                    </QueryClientProvider>
                )
                await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

                expect(
                    EmailIntegrationListVerificationStatusMock
                ).not.toHaveBeenCalledWith(
                    expect.objectContaining({
                        isDomainVerificationWarningGmailOutlookVisible: true,
                    }),
                    {}
                )
            }
        )

        it.each([EmailProvider.Mailgun, EmailProvider.Sendgrid])(
            'should render the page without warning when a Outlook integration is deactivated',
            async (emailProvider: EmailProvider) => {
                const get = fetchEmailDomainsMock.mockResolvedValueOnce([])

                renderWithRouter(
                    <QueryClientProvider client={queryClient}>
                        <Provider store={store}>
                            <EmailIntegrationList
                                {...commonProps}
                                integrations={fromJS([
                                    getOutlookIntegration(
                                        1,
                                        true,
                                        true,
                                        emailProvider
                                    ),
                                ])}
                            />
                        </Provider>
                    </QueryClientProvider>
                )
                await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

                expect(
                    EmailIntegrationListVerificationStatusMock
                ).not.toHaveBeenCalledWith(
                    expect.objectContaining({
                        isDomainVerificationWarningGmailOutlookVisible: true,
                    }),
                    {}
                )
            }
        )

        it('should redirect to domain verification tab when provider is not Sendgrid', async () => {
            fetchEmailDomainsMock.mockResolvedValueOnce([])
            const integration = getEmailIntegration(1)

            const component = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <EmailIntegrationList
                            {...commonProps}
                            integrations={fromJS([integration])}
                        />
                    </Provider>
                </QueryClientProvider>
            )

            await component.findByText(integration.meta.address)

            fireEvent.click(component.getByText(integration.meta.address))

            expect(history.push).toHaveBeenCalledWith(
                `/app/settings/channels/email/${integration.id}/dns`
            )
        })

        it('should redirect to outbound verification settings tab when provider is Sendgrid', async () => {
            fetchEmailDomainsMock.mockResolvedValueOnce([])
            const integration = getEmailIntegration(1)

            const component = renderWithRouter(
                <QueryClientProvider client={queryClient}>
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
                </QueryClientProvider>
            )

            await component.findByText(integration.meta.address)

            fireEvent.click(component.getByText(integration.meta.address))

            expect(history.push).toHaveBeenCalledWith(
                `/app/settings/channels/email/${integration.id}/outbound-verification`
            )
        })
    })
})
