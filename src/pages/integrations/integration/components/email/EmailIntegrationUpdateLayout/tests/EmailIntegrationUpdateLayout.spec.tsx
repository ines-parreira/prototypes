import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ComponentProps} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'

import EmailIntegrationUpdateLayout from '../EmailIntegrationUpdateLayout'

const minProps: ComponentProps<typeof EmailIntegrationUpdateLayout> = {
    integration: fromJS({
        id: 1,
        meta: {address: 'some-email@address.com'},
    }),
}

describe('EmailIntegrationUpdateLayout', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.NewDomainVerification]: false,
        })
    })

    it('should render the layout for an email integration update', () => {
        const {container} = render(
            <EmailIntegrationUpdateLayout {...minProps}>
                <span>
                    Praesent commodo cursus magna, vel scelerisque nisl
                    consectetur et.
                </span>
            </EmailIntegrationUpdateLayout>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render Domain Verification tab name even if provider is Sendgrid when feature flag is enabled', () => {
        mockFlags({
            [FeatureFlagKey.NewDomainVerification]: true,
        })

        render(
            <EmailIntegrationUpdateLayout
                {...minProps}
                integration={fromJS({
                    id: 1,
                    meta: {address: 'test@gorgias.com', provider: 'sendgrid'},
                })}
            >
                <span>
                    Praesent commodo cursus magna, vel scelerisque nisl
                    consectetur et.
                </span>
            </EmailIntegrationUpdateLayout>
        )

        expect(screen.getByText('Domain Verification')).toBeInTheDocument()
    })
})
