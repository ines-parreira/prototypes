import React from 'react'

import {fromJS} from 'immutable'
import {render, waitFor} from '@testing-library/react'

import {EmailDomainVerificationContainer} from '../EmailDomainVerification'

import {IntegrationType, EmailProvider} from 'models/integration/constants'
import {UserRole} from 'config/types/user'

describe('<EmailDomainVerificationContainer/>', () => {
    const commonProps = {
        integration: fromJS({
            id: 1,
            meta: {
                address: 'test@gorgias.com',
            },
        }),
        integrationId: 1,

        loading: fromJS({}),
        actions: {
            fetchEmailDomain: jest.fn(),
            createEmailDomain: jest.fn(),
            deleteEmailDomain: jest.fn(),
        },
        currentUser: fromJS({
            role: {
                name: UserRole.BasicAgent,
            },
        }),
    }
    const adminUser = {
        role: {
            name: UserRole.Admin,
        },
    }

    describe('render()', () => {
        it('should render the page when domain is verified', () => {
            const {container} = render(
                <EmailDomainVerificationContainer
                    emailDomain={fromJS({
                        verified: true,
                        data: {
                            sending_dns_records: [],
                        },
                    })}
                    {...commonProps}
                />
            )

            expect(container).toMatchSnapshot()
        })
        it('should render the page when domain is not verified', () => {
            const {container} = render(
                <EmailDomainVerificationContainer
                    emailDomain={fromJS({
                        verified: false,
                        data: {
                            sending_dns_records: [],
                        },
                    })}
                    {...commonProps}
                />
            )

            expect(container).toMatchSnapshot()
        })
        it('should render the page when there is no domain - mailgun', () => {
            const {container} = render(
                <EmailDomainVerificationContainer
                    emailDomain={null}
                    {...commonProps}
                    integration={fromJS({
                        ...commonProps.integration,
                        meta: {
                            address: 'test@gorgias.com',
                            provider: EmailProvider.Mailgun,
                        },
                    })}
                />
            )

            expect(container).toMatchSnapshot()
        })
        it('should render the page when there is no domain - sendgrid', () => {
            const {container} = render(
                <EmailDomainVerificationContainer
                    emailDomain={null}
                    {...commonProps}
                    integration={fromJS({
                        ...commonProps.integration,
                        meta: {
                            address: 'test@gorgias.com',
                            provider: EmailProvider.Sendgrid,
                        },
                    })}
                />
            )

            expect(container).toMatchSnapshot()
        })
        it.each([IntegrationType.Gmail, IntegrationType.Outlook])(
            'should render the page with an optional verification information box when there is no domain',
            (integrationType) => {
                const {container} = render(
                    <EmailDomainVerificationContainer
                        emailDomain={null}
                        {...commonProps}
                        integration={fromJS({id: 1, type: integrationType})}
                    />
                )

                expect(container).toMatchSnapshot()
            }
        )

        it('should load the domain when none is provided', () => {
            render(<EmailDomainVerificationContainer {...commonProps} />)

            expect(commonProps.actions.fetchEmailDomain).toHaveBeenCalledWith(
                'gorgias.com'
            )
        })

        it('should render a delete button to account admins', () => {
            // Patch Date.now to always get the same time-based IDs.
            let frozenTime = 42
            const now = Date.now
            Date.now = () => frozenTime++

            const {container} = render(
                <EmailDomainVerificationContainer
                    emailDomain={fromJS({
                        verified: true,
                        data: {
                            sending_dns_records: [],
                        },
                    })}
                    {...commonProps}
                    currentUser={fromJS(adminUser)}
                />
            )

            expect(container).toMatchSnapshot()

            // Unpatch Date.now
            Date.now = now
        })

        it('clicking the delete button should trigger deletion', () => {
            const {getByText} = render(
                <EmailDomainVerificationContainer
                    emailDomain={fromJS({
                        verified: true,
                        data: {
                            sending_dns_records: [],
                        },
                    })}
                    {...commonProps}
                    currentUser={fromJS(adminUser)}
                />
            )

            getByText('Delete').click()

            waitFor(() =>
                expect(
                    commonProps.actions.deleteEmailDomain
                ).toHaveBeenCalledWith('gorgias.com')
            )
        })
    })
})
