import {render, screen} from '@testing-library/react'
import React from 'react'
import {integrationsState} from 'fixtures/integrations'
import {IntegrationType} from 'models/integration/constants'
import {EmailIntegration} from 'models/integration/types'
import EmailVerification from '../EmailVerification'

const integration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Email
) as unknown as EmailIntegration

describe('EmailVerification', () => {
    it('should display both Domain Verification and Single Sender Verification cards', () => {
        render(
            <EmailVerification
                baseURL={'outboundVerificationMockUrl'}
                integration={integration}
            />
        )

        expect(screen.getByText('Domain Verification')).toBeTruthy()
        expect(screen.getByText('Single Sender Verification')).toBeTruthy()
    })
})
