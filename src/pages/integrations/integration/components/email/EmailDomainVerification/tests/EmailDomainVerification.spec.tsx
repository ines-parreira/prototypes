import React, {ComponentProps} from 'react'

import {fromJS} from 'immutable'
import {render, waitFor} from '@testing-library/react'
import {History, Location} from 'history'
import {match} from 'react-router-dom'

import {IntegrationType, EmailProvider} from 'models/integration/constants'
import {UserRole} from 'config/types/user'

import {EmailDomainVerificationContainer} from '../EmailDomainVerification'

describe('<EmailDomainVerificationContainer/>', () => {
    const minProps: ComponentProps<typeof EmailDomainVerificationContainer> = {
        integration: fromJS({
            id: 1,
            meta: {
                address: 'test@gorgias.com',
            },
        }),
        loading: fromJS({}),
        emailDomain: fromJS({}),
        currentUser: fromJS({
            role: {
                name: UserRole.BasicAgent,
            },
        }),
        actions: {
            fetchEmailDomain: jest.fn(),
            createEmailDomain: jest.fn(),
            deleteEmailDomain: jest.fn(),
        },
        history: {} as History,
        location: {} as Location,
        match: {} as match,
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
                    {...minProps}
                    emailDomain={fromJS({
                        verified: true,
                        data: {
                            sending_dns_records: [],
                        },
                    })}
                />
            )

            expect(container).toMatchSnapshot()
        })
        it('should render the page when domain is not verified', () => {
            const {container} = render(
                <EmailDomainVerificationContainer
                    {...minProps}
                    emailDomain={fromJS({
                        verified: false,
                        data: {
                            sending_dns_records: [],
                        },
                    })}
                />
            )

            expect(container).toMatchSnapshot()
        })
        it('should render the page when there is no domain - mailgun', () => {
            const {container} = render(
                <EmailDomainVerificationContainer
                    {...minProps}
                    integration={fromJS({
                        ...minProps.integration,
                        meta: {
                            address: 'test@gorgias.com',
                            provider: EmailProvider.Mailgun,
                        },
                    })}
                    emailDomain={null as any}
                />
            )

            expect(container).toMatchSnapshot()
        })
        it('should render the page when there is no domain - sendgrid', () => {
            const {container} = render(
                <EmailDomainVerificationContainer
                    {...minProps}
                    integration={fromJS({
                        ...minProps.integration,
                        meta: {
                            address: 'test@gorgias.com',
                            provider: EmailProvider.Sendgrid,
                        },
                    })}
                    emailDomain={null as any}
                />
            )

            expect(container).toMatchSnapshot()
        })
        it.each([IntegrationType.Gmail, IntegrationType.Outlook])(
            'should render the page with an optional verification information box when there is no domain',
            (integrationType) => {
                const {container} = render(
                    <EmailDomainVerificationContainer
                        {...minProps}
                        emailDomain={null as any}
                        integration={fromJS({id: 1, type: integrationType})}
                    />
                )

                expect(container).toMatchSnapshot()
            }
        )

        it('should load the domain when none is provided', () => {
            render(
                <EmailDomainVerificationContainer
                    {...minProps}
                    emailDomain={null as any}
                />
            )

            expect(minProps.actions.fetchEmailDomain).toHaveBeenCalledWith(
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
                    {...minProps}
                    emailDomain={fromJS({
                        verified: true,
                        data: {
                            sending_dns_records: [],
                        },
                    })}
                    currentUser={fromJS(adminUser)}
                />
            )

            expect(container).toMatchSnapshot()

            // Unpatch Date.now
            Date.now = now
        })

        // TODO: During TypeScript migration, it was discovered that the test was a false positive, as the waitFor was not awaited.
        // Check why the test fails in a future issue.
        it.skip('clicking the delete button should trigger deletion', async () => {
            const {getByText} = render(
                <EmailDomainVerificationContainer
                    {...minProps}
                    emailDomain={fromJS({
                        verified: true,
                        data: {
                            sending_dns_records: [],
                        },
                    })}
                    currentUser={fromJS(adminUser)}
                />
            )

            getByText('Delete').click()

            await waitFor(() =>
                expect(minProps.actions.deleteEmailDomain).toHaveBeenCalledWith(
                    'gorgias.com'
                )
            )
        })
    })
})
