import {QueryClientProvider} from '@tanstack/react-query'
import {render, waitFor, screen, fireEvent} from '@testing-library/react'
import {List, fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
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
import {isBaseEmailIntegration, isOutboundVerifiedSendgrid} from '../helpers'
import {useEmailOnboardingCompleteCheck} from '../hooks/useEmailOnboarding'
import {fetchEmailDomains} from '../resources'

const queryClient = mockQueryClient()

jest.mock(
    'pages/integrations/integration/components/email/EmailIntegrationListVerificationStatus'
)

jest.mock('../helpers')
jest.mock('../resources')
jest.mock('pages/history')
jest.mock('../hooks/useEmailOnboarding')

const fetchEmailDomainsMock = assumeMock(fetchEmailDomains)
const EmailIntegrationListVerificationStatusMock = assumeMock(
    EmailIntegrationListVerificationStatus
)
const isBaseEmailIntegrationMock = assumeMock(isBaseEmailIntegration)
const isOutboundVerifiedSendgridMock = assumeMock(isOutboundVerifiedSendgrid)
const useEmailOnboardingCompleteCheckMock = assumeMock(
    useEmailOnboardingCompleteCheck
)

describe('<EmailIntegrationList/>', () => {
    function getEmailIntegration(
        id: number,
        deactivated = false,
        provider = EmailProvider.Mailgun,
        address = 'email@gorgias-test.com',
        verified = true
    ) {
        return {
            id,
            type: IntegrationType.Email,
            ...(deactivated && {deactivated_datetime: '2024-01-01T00:00:00'}),
            name: `My Email Integration ${id}`,
            meta: {
                verified,
                address,
                provider,
            },
        }
    }

    function getGmailIntegration(
        id: number,
        deactivated = false,
        sendingEnabled: boolean,
        provider = EmailProvider.Mailgun,
        verified = true
    ) {
        return {
            id,
            type: IntegrationType.Gmail,
            ...(deactivated && {deactivated_datetime: '2024-01-01T00:00:00'}),
            name: `My GMail Integration ${id}`,
            meta: {
                address: 'email@gmail.com',
                verified,
                enable_gmail_sending: sendingEnabled,
                provider: provider,
            },
        }
    }

    function getOutlookIntegration(
        id: number,
        deactivated = false,
        sendingEnabled: boolean,
        provider = EmailProvider.Mailgun,
        verified = true
    ) {
        return {
            id,
            type: IntegrationType.Outlook,
            ...(deactivated && {deactivated_datetime: '2024-01-01T00:00:00'}),
            name: `My Outlook Integration ${id}`,
            meta: {
                address: 'email@Outlook.com',
                verified,
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
            [FeatureFlagKey.NewDomainVerification]: false,
        }))
        isBaseEmailIntegrationMock.mockReturnValue(false)
        EmailIntegrationListVerificationStatusMock.mockImplementation(() => (
            <div>EmailIntegrationListVerificationStatus</div>
        ))
        useEmailOnboardingCompleteCheckMock.mockReturnValue({
            isOnboardingComplete: true,
        } as any)
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
            isBaseEmailIntegrationMock.mockReturnValue(true)

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
                isOutboundVerifiedSendgridMock.mockReturnValue(false)

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
                isOutboundVerifiedSendgridMock.mockReturnValue(false)

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

        describe('redirect URLs', () => {
            it.each([
                {
                    description:
                        'should redirect to domain verification - active Mailgun forwarding email',
                    integration: getEmailIntegration(
                        1,
                        false,
                        EmailProvider.Mailgun
                    ),
                    expected: `/app/settings/channels/email/${1}/dns`,
                },
                {
                    description:
                        'should redirect to domain verification - inactive Mailgun forwarding email',
                    integration: getEmailIntegration(
                        1,
                        true,
                        EmailProvider.Mailgun
                    ),
                    expected: `/app/settings/channels/email/${1}/dns`,
                },
                {
                    description:
                        'should redirect to outbound verification - active Sendgrid forwarding email',
                    integration: getEmailIntegration(
                        1,
                        false,
                        EmailProvider.Sendgrid
                    ),
                    expected: `/app/settings/channels/email/${1}/outbound-verification`,
                },
                {
                    description:
                        'should redirect to outbound verification - inactive Sendgrid forwarding email',
                    integration: getEmailIntegration(
                        1,
                        true,
                        EmailProvider.Sendgrid
                    ),
                    expected: `/app/settings/channels/email/${1}/outbound-verification`,
                },
                {
                    description:
                        'should redirect to domain verification - gmail',
                    integration: getGmailIntegration(1, false, true),
                    expected: `/app/settings/channels/email/${1}/dns`,
                },
                {
                    description:
                        'should redirect to domain verification - outlook',
                    integration: getOutlookIntegration(1, false, true),
                    expected: `/app/settings/channels/email/${1}/dns`,
                },
                {
                    description:
                        'should redirect to onboarding wizard domain verification when onboarding is not complete - forward email',
                    integration: getEmailIntegration(
                        1,
                        false,
                        EmailProvider.Mailgun
                    ),
                    expected: `/app/settings/channels/email/${1}/onboarding/domain-verification`,
                    onboardingComplete: false,
                    newDomainVerificationFFEnabled: true,
                },
                {
                    description:
                        'should redirect to domain verification tab when onboarding is complete but domain verification is incomplete - forward email',
                    integration: getEmailIntegration(
                        1,
                        false,
                        EmailProvider.Mailgun
                    ),
                    expected: `/app/settings/channels/email/${1}/dns`,
                    onboardingComplete: true,
                    newDomainVerificationFFEnabled: true,
                },

                {
                    description:
                        'should not redirect to onboarding wizard domain verification when onboardingComplete state is false - gmail',
                    integration: getGmailIntegration(1, false, true),
                    expected: `/app/settings/channels/email/${1}/dns`,
                    onboardingComplete: false,
                    newDomainVerificationFFEnabled: true,
                },
            ])(
                '(outbound unverified) $description',
                async ({
                    integration,
                    expected,
                    newDomainVerificationFFEnabled,
                    onboardingComplete,
                }) => {
                    mockFlags({
                        [FeatureFlagKey.NewDomainVerification]:
                            newDomainVerificationFFEnabled ?? false,
                    })
                    useEmailOnboardingCompleteCheckMock.mockReturnValue({
                        isOnboardingComplete: onboardingComplete,
                    } as any)

                    fetchEmailDomainsMock.mockResolvedValueOnce([])
                    isOutboundVerifiedSendgridMock.mockReturnValue(false)

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

                    fireEvent.click(
                        component.getByText(integration.meta.address)
                    )

                    expect(history.push).toHaveBeenCalledWith(expected)

                    expect(
                        useEmailOnboardingCompleteCheckMock
                    ).toHaveBeenCalledWith(integration)
                }
            )

            it.each([
                getGmailIntegration(1, true, true),
                getOutlookIntegration(1, true, true),
            ])(
                '(inactive integrations) should redirect to the correct page when clicking on the integration - $type',
                async (integration) => {
                    fetchEmailDomainsMock.mockResolvedValueOnce([])
                    isOutboundVerifiedSendgridMock.mockReturnValue(false)

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
                    fireEvent.click(
                        component.getByText(integration.meta.address)
                    )
                    expect(history.push).toHaveBeenCalledWith(
                        `/app/settings/channels/email/${1}`
                    )
                }
            )

            it.each([
                {
                    description:
                        'inbound verified integration, forward integration',
                    integration: getEmailIntegration(
                        1,
                        false,
                        EmailProvider.Sendgrid,
                        'email@gorgias-test.com',
                        true
                    ),
                    expected: `/app/settings/channels/email/${1}`,
                },
                {
                    description:
                        'inbound unverified integration, forward integration',
                    integration: getEmailIntegration(
                        1,
                        false,
                        EmailProvider.Sendgrid,
                        'email@gorgias-test.com',
                        false
                    ),
                    expected: `/app/settings/channels/email/${1}/verification`,
                },
                {
                    description:
                        'inbound unverified integration, gmail integration',
                    integration: getGmailIntegration(
                        1,
                        false,
                        true,
                        EmailProvider.Sendgrid,
                        false
                    ),
                    expected: `/app/settings/channels/email/${1}`,
                },
                {
                    description:
                        'inbound unverified integration, outlook integration',
                    integration: getOutlookIntegration(
                        1,
                        false,
                        true,
                        EmailProvider.Sendgrid,
                        false
                    ),
                    expected: `/app/settings/channels/email/${1}`,
                },
                {
                    description:
                        'inbound verified integration, gmail integration',
                    integration: getGmailIntegration(
                        1,
                        false,
                        true,
                        EmailProvider.Sendgrid,
                        true
                    ),
                    expected: `/app/settings/channels/email/${1}`,
                },
                {
                    description:
                        'inbound verified integration, outlook integration',
                    integration: getOutlookIntegration(
                        1,
                        false,
                        true,
                        EmailProvider.Sendgrid,
                        true
                    ),
                    expected: `/app/settings/channels/email/${1}`,
                },
                {
                    description: 'unverified base integration',
                    integration: getEmailIntegration(
                        1,
                        false,
                        EmailProvider.Sendgrid
                    ),
                    isBaseIntegration: true,
                    expected: `/app/settings/channels/email/${1}`,
                },
            ])(
                '(outbound verified) should redirect to the correct page when clicking on the integration - $description',
                async ({integration, expected, isBaseIntegration}) => {
                    fetchEmailDomainsMock.mockResolvedValueOnce([])
                    isOutboundVerifiedSendgridMock.mockReturnValue(true)
                    isBaseEmailIntegrationMock.mockReturnValue(
                        !!isBaseIntegration
                    )

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
                    fireEvent.click(
                        component.getByText(integration.meta.address)
                    )
                    expect(history.push).toHaveBeenCalledWith(expected)
                }
            )
        })

        it('should not display verification status for base email integrations', () => {
            fetchEmailDomainsMock.mockResolvedValueOnce([])
            isBaseEmailIntegrationMock.mockReturnValue(true)

            const integration = getEmailIntegration(
                1,
                false,
                EmailProvider.Sendgrid
            )

            renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <EmailIntegrationList
                            {...commonProps}
                            integrations={fromJS([integration])}
                        />
                    </Provider>
                </QueryClientProvider>
            )

            expect(
                screen.queryByText('EmailIntegrationListVerificationStatus')
            ).not.toBeInTheDocument()
        })
    })
})
