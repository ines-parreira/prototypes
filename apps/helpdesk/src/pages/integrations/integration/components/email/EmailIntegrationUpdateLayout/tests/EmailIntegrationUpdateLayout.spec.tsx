import type { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import type { Integration } from 'models/integration/types'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'
import { renderWithRouter } from 'utils/testing'

import {
    canIntegrationDomainBeVerified,
    isGenericEmailIntegration,
} from '../../helpers'
import EmailIntegrationUpdateLayout from '../EmailIntegrationUpdateLayout'

jest.mock('../../helpers')

const isGenericEmailIntegrationMock = assumeMock(isGenericEmailIntegration)
const canIntegrationDomainBeVerifiedMock = assumeMock(
    canIntegrationDomainBeVerified,
)

const integration = {
    id: 1,
    name: 'name',
    meta: { address: 'some-email@address.com' },
}

const minProps: ComponentProps<typeof EmailIntegrationUpdateLayout> = {
    integration: integration as Integration,
}

const renderComponent = (
    props: ComponentProps<typeof EmailIntegrationUpdateLayout>,
) => renderWithRouter(<EmailIntegrationUpdateLayout {...props} />)

describe('EmailIntegrationUpdateLayout', () => {
    beforeEach(() => {
        mockFeatureFlags({
            [FeatureFlagKey.NewDomainVerification]: false,
        })
        isGenericEmailIntegrationMock.mockReturnValue(true)
        canIntegrationDomainBeVerifiedMock.mockReturnValue(true)
    })

    it('should not render anything if the integration is not of type email', () => {
        isGenericEmailIntegrationMock.mockReturnValue(false)

        const { container } = renderComponent(minProps)

        expect(container.innerHTML).toBe('')
    })

    it('should render the layout for an email integration update', () => {
        renderComponent({
            ...minProps,
            children: (
                <div>
                    <p>
                        Praesent commodo cursus magna, vel scelerisque nisl
                        consectetur et.
                    </p>
                </div>
            ),
        })

        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('name')).toBeInTheDocument()
        expect(screen.getByText('some-email@address.com')).toBeInTheDocument()

        expect(
            screen.getByText(
                'Praesent commodo cursus magna, vel scelerisque nisl consectetur et.',
            ),
        ).toBeInTheDocument()

        const preferencesLink = screen.getByText('Preferences')
        expect(preferencesLink).toBeInTheDocument()
        expect(preferencesLink.closest('a')).toHaveAttribute(
            'href',
            `/app/settings/channels/email/${integration.id}`,
        )
    })

    it('should render the layout for an email integration update with Sendgrid provider', () => {
        renderComponent({
            ...minProps,
            integration: {
                ...integration,
                meta: { provider: 'sendgrid' },
            } as Integration,
        })

        expect(
            screen.queryByText('Domain Verification'),
        ).not.toBeInTheDocument()

        const outboundVerificationLink = screen.getByText(
            'Outbound Verification',
        )
        expect(outboundVerificationLink).toBeInTheDocument()
        expect(outboundVerificationLink.closest('a')).toHaveAttribute(
            'href',
            `/app/settings/channels/email/${integration.id}/outbound-verification`,
        )
    })

    it('should render the layout for an email integration update with Mailgun provider', () => {
        renderComponent({
            ...minProps,
            integration: {
                ...integration,
                meta: { provider: 'mailgun' },
            } as Integration,
        })

        const domainVerificationLink = screen.getByText('Domain Verification')
        expect(domainVerificationLink).toBeInTheDocument()
        expect(domainVerificationLink.closest('a')).toHaveAttribute(
            'href',
            `/app/settings/channels/email/${integration.id}/dns`,
        )

        expect(
            screen.queryByText('Outbound Verification'),
        ).not.toBeInTheDocument()
    })

    it(`should only render preferences tab for domains that can't be verified`, () => {
        canIntegrationDomainBeVerifiedMock.mockReturnValue(false)

        renderComponent(minProps)

        expect(screen.getByText('Preferences')).toBeInTheDocument()
        expect(
            screen.queryByText('Domain Verification'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Outbound Verification'),
        ).not.toBeInTheDocument()
    })

    it('should render Domain Verification tab name even if provider is Sendgrid when feature flag is enabled', () => {
        mockFeatureFlags({
            [FeatureFlagKey.NewDomainVerification]: true,
        })

        renderWithRouter(
            <EmailIntegrationUpdateLayout
                {...minProps}
                integration={fromJS({
                    id: 1,
                    meta: { address: 'test@gorgias.com', provider: 'sendgrid' },
                })}
            >
                <span>
                    Praesent commodo cursus magna, vel scelerisque nisl
                    consectetur et.
                </span>
            </EmailIntegrationUpdateLayout>,
        )

        expect(screen.getByText('Domain Verification')).toBeInTheDocument()
    })
})
