import {EmailDomain} from '@gorgias/api-queries'
import {QueryClientProvider} from '@tanstack/react-query'
import {render, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'

import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {UserRole} from 'config/types/user'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import * as helpers from '../../helpers'
import EmailDomainVerification from '../EmailDomainVerification'
import * as hook from '../useDomainVerification'

const queryClient = mockQueryClient()

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/useAppDispatch', () => () => jest.fn())

describe('<EmailDomainVerification/>', () => {
    const minProps: ComponentProps<typeof EmailDomainVerification> = {
        integration: {
            id: 1,
            meta: {
                address: 'test@gorgias.com',
            },
        } as any,
        loading: {},
    }

    const getEmailDomain = ({verified} = {verified: true}): EmailDomain => ({
        name: 'gorgias.com',
        provider: 'sendgrid',
        verified,
        data: {
            domain: 'gorgias.com',
            valid: verified,
            sending_dns_records: [
                {
                    verified,
                    value: 'k=rsa; p=EXPECTED',
                    host: 'm1._domainkey.gorgias.com',
                    record_type: 'txt',
                    current_values: ['k=rsa; p=CURRENT'],
                },
            ],
        },
    })

    const defaultHookState: hook.UseDomainVerificationRequestHookResult = {
        domain: getEmailDomain(),
        isRequested: false,
        isVerifying: false,
        isFetching: false,
        isDeleting: false,
        isPending: false,
        verifyDomain: jest.fn(),
        deleteDomain: jest.fn(),
    }

    const renderComponent = (props = {}) =>
        render(
            <QueryClientProvider client={queryClient}>
                <Provider
                    store={mockStore({
                        currentUser: fromJS({
                            role: {
                                name: UserRole.Admin,
                            },
                        }),
                    })}
                >
                    <EmailDomainVerification {...minProps} {...props} />
                </Provider>
            </QueryClientProvider>
        )

    describe('when the integration is a base integration', () => {
        it('should render just an alert if the integration is a base email integration', () => {
            jest.spyOn(helpers, 'isBaseEmailAddress').mockReturnValueOnce(true)

            renderComponent()

            expect(
                screen.getByText(
                    'The base email integration cannot have a domain associated.'
                )
            ).toBeInTheDocument()
        })

        it('should not break rendering when the address is not defined', () => {
            const baseAddressMock = jest.spyOn(helpers, 'isBaseEmailAddress')
            renderComponent({
                ...minProps,
                integration: {
                    ...minProps.integration,
                    meta: {
                        address: undefined,
                    },
                },
            })
            expect(baseAddressMock).toHaveBeenCalledWith('')
        })
    })

    describe('when the domain exists', () => {
        it('should render the correct records list page when domain is verified', () => {
            jest.spyOn(hook, 'useDomainVerification').mockImplementation(
                () => ({
                    ...defaultHookState,
                    domain: getEmailDomain({verified: true}),
                })
            )

            const {container} = renderComponent()

            expect(container).toHaveTextContent(
                'The domain gorgias.com has been verified.'
            )

            expect(screen.getByText('txt')).toBeInTheDocument()
            expect(screen.getByText('m1._domainkey')).toBeInTheDocument()
            expect(screen.getByText('k=rsa; p=EXPECTED')).toBeInTheDocument()
            expect(screen.getByText('k=rsa; p=CURRENT')).toBeInTheDocument()
        })

        it('should render the correct records list page when domain is not verified', () => {
            jest.spyOn(hook, 'useDomainVerification').mockImplementation(
                () => ({
                    ...defaultHookState,
                    domain: getEmailDomain({verified: false}),
                })
            )

            const {container} = renderComponent()

            expect(container).toHaveTextContent(
                'The domain gorgias.com has not yet been verified.'
            )

            expect(screen.getByText('txt')).toBeInTheDocument()
            expect(screen.getByText('m1._domainkey')).toBeInTheDocument()
            expect(screen.getByText('k=rsa; p=EXPECTED')).toBeInTheDocument()
            expect(screen.getByText('k=rsa; p=CURRENT')).toBeInTheDocument()
        })
    })

    describe('when the domain does not exist', () => {
        it('should render the domain creation form for mailgun integrations', () => {
            jest.spyOn(hook, 'useDomainVerification').mockImplementation(
                () => ({
                    ...defaultHookState,
                    domain: undefined,
                })
            )
            renderComponent({
                integration: {
                    id: 1,
                    meta: {
                        address: 'test@gorgias.com',
                        provider: 'mailgun',
                    },
                } as any,
                loading: {},
            })

            expect(screen.getByText('DKIM key size')).toBeInTheDocument()
            expect(screen.getByText('Add Domain')).toBeInTheDocument()
        })

        it('should render the loader while the integration details are loading', () => {
            jest.spyOn(hook, 'useDomainVerification').mockImplementation(
                () => ({
                    ...defaultHookState,
                    domain: undefined,
                })
            )

            renderComponent({
                integration: {
                    id: 1,
                    meta: {
                        address: 'test@gorgias.com',
                        provider: 'mailgun',
                    },
                } as any,
                loading: {
                    integration: true,
                },
            })

            expect(screen.getByTestId('loader')).toBeInTheDocument()
            expect(screen.queryByText('DKIM key size')).not.toBeInTheDocument()
            expect(screen.queryByText('Add Domain')).not.toBeInTheDocument()
        })
    })

    describe('when loading data', () => {
        it('should render a loader when the integration is loading', () => {
            renderComponent({
                loading: {integration: true},
            })

            expect(screen.getByTestId('loader')).toBeInTheDocument()
        })

        it('should render a loader when domain is loading', () => {
            jest.spyOn(hook, 'useDomainVerification').mockImplementation(
                () => ({
                    ...defaultHookState,
                    domain: undefined,
                    isFetching: true,
                })
            )

            renderComponent()

            expect(screen.getByTestId('loader')).toBeInTheDocument()
        })
    })

    describe('performable actions', () => {
        it('should call verifyDomain when the verify domain button is clicked', () => {
            jest.spyOn(hook, 'useDomainVerification').mockImplementation(
                () => ({
                    ...defaultHookState,
                    domain: getEmailDomain({verified: false}),
                })
            )

            renderComponent()

            screen.getByText('Check Status').click()

            expect(defaultHookState.verifyDomain).toHaveBeenCalled()
        })

        it('should call deleteDomain when the domain deletion button is clicked', async () => {
            jest.spyOn(hook, 'useDomainVerification').mockImplementation(
                () => ({
                    ...defaultHookState,
                    domain: getEmailDomain({verified: false}),
                })
            )

            renderComponent()

            screen.getByText('Delete Domain').click()
            await waitFor(() => screen.getByText('Confirm'))
            screen.getByText('Confirm').click()

            expect(defaultHookState.deleteDomain).toHaveBeenCalled()
        })
    })
})
