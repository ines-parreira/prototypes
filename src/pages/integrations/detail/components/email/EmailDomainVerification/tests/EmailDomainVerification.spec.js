import React from 'react'

import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {IntegrationType} from '../../../../../../../models/integration/constants.ts'
import {EmailDomainVerificationContainer} from '../EmailDomainVerification.tsx'

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
        it('should render the page when there is no domain', () => {
            const {container} = render(
                <EmailDomainVerificationContainer
                    emailDomain={null}
                    {...commonProps}
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
    })
})
