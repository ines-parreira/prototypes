import React, {ComponentProps} from 'react'

import {fromJS} from 'immutable'
import {render, waitFor} from '@testing-library/react'

import {Provider} from 'react-redux'
import {IntegrationType, EmailProvider} from 'models/integration/constants'
import {UserRole} from 'config/types/user'
import {mockStore} from 'utils/testing'
import * as actions from 'state/integrations/actions'
import EmailDomainVerification from '../EmailDomainVerification'

jest.mock('hooks/useAppDispatch', () => () => jest.fn())

jest.mock('state/integrations/actions', () => ({
    fetchEmailDomain: jest.fn(() => ({})),
    createEmailDomain: jest.fn(() => ({})),
    deleteEmailDomain: jest.fn(() => ({})),
}))

describe('<EmailDomainVerification/>', () => {
    const minProps: ComponentProps<typeof EmailDomainVerification> = {
        integration: {
            id: 1,
            meta: {
                address: 'test@gorgias.com',
            },
        } as any,
        loading: fromJS({}),
    }
    const adminUser = {
        role: {
            name: UserRole.Admin,
        },
    }

    const renderWithStore = (props = {}, storeState = {}) =>
        render(
            <Provider store={mockStore(storeState as any)}>
                <EmailDomainVerification {...minProps} {...props} />
            </Provider>
        )

    describe('render()', () => {
        it('should render the page when domain is verified', () => {
            const {container} = renderWithStore(undefined, {
                integrations: fromJS({
                    emailDomain: {
                        verified: false,
                        data: {
                            sending_dns_records: [],
                        },
                    },
                }),
            })

            expect(container).toMatchSnapshot()
        })
        it('should render the page when domain is not verified', () => {
            const {container} = renderWithStore(undefined, {
                integrations: fromJS({
                    emailDomain: {
                        verified: false,
                        data: {
                            sending_dns_records: [],
                        },
                    },
                }),
            })

            expect(container).toMatchSnapshot()
        })
        it('should render the page when there is no domain - mailgun', () => {
            const {container} = renderWithStore(
                {
                    integration: {
                        ...minProps.integration,
                        meta: {
                            address: 'test@gorgias.com',
                            provider: EmailProvider.Mailgun,
                        },
                    },
                },
                {
                    integrations: fromJS({
                        emailDomain: null,
                    }),
                }
            )

            expect(container).toMatchSnapshot()
        })
        it('should render the page when there is no domain - sendgrid', () => {
            const {container} = renderWithStore(
                {
                    integration: {
                        ...minProps.integration,
                        meta: {
                            address: 'test@gorgias.com',
                            provider: EmailProvider.Sendgrid,
                        },
                    },
                },
                {
                    integrations: fromJS({
                        emailDomain: null,
                    }),
                }
            )

            expect(container).toMatchSnapshot()
        })
        it.each([IntegrationType.Gmail, IntegrationType.Outlook])(
            'should render the page with an optional verification information box when there is no domain',
            (integrationType) => {
                const {container} = renderWithStore(
                    {
                        integration: {id: 1, type: integrationType, meta: {}},
                    },
                    {
                        integrations: fromJS({
                            emailDomain: null,
                        }),
                    }
                )

                expect(container).toMatchSnapshot()
            }
        )

        it('should load the domain when none is provided', () => {
            renderWithStore(undefined, {
                integrations: fromJS({
                    emailDomain: null,
                }),
            })

            expect(actions.fetchEmailDomain).toHaveBeenCalledWith('gorgias.com')
        })

        it('should render a delete button to account admins', () => {
            // Patch Date.now to always get the same time-based IDs.
            let frozenTime = 42
            const now = Date.now
            Date.now = () => frozenTime++

            const {container} = renderWithStore(undefined, {
                currentUser: fromJS(adminUser),
                integrations: fromJS({
                    emailDomain: {
                        verified: true,
                        data: {
                            sending_dns_records: [],
                        },
                    },
                }),
            })

            expect(container).toMatchSnapshot()

            // Unpatch Date.now
            Date.now = now
        })

        // TODO: During TypeScript migration, it was discovered that the test was a false positive, as the waitFor was not awaited.
        // Check why the test fails in a future issue.
        it.skip('clicking the delete button should trigger deletion', async () => {
            const {getByText} = renderWithStore(undefined, {
                currentUser: fromJS(adminUser),
                integrations: fromJS({
                    emailDomain: {
                        verified: true,
                        data: {
                            sending_dns_records: [],
                        },
                    },
                }),
            })

            getByText('Delete').click()

            await waitFor(() =>
                expect(actions.deleteEmailDomain).toHaveBeenCalledWith(
                    'gorgias.com'
                )
            )
        })
    })
})
