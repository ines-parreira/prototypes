import {EmailIntegration} from '@gorgias/api-queries'
import {render, screen} from '@testing-library/react'
import React from 'react'
import {BrowserRouter} from 'react-router-dom'

import {IntegrationType} from 'models/integration/types'
import EmailIntegrationOnboardingBreadcrumbs from 'pages/integrations/integration/components/email/EmailIntegrationOnboardingBreadcrumbs'

describe('EmailIntegrationOnboardingBreadcrumbs', () => {
    it('renders the breadcrumb items correctly without integration', () => {
        render(
            <BrowserRouter>
                <EmailIntegrationOnboardingBreadcrumbs integration={null} />
            </BrowserRouter>
        )

        // Check for static breadcrumb items
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Add email address')).toBeInTheDocument()
        expect(
            screen.getByText('Connect other email provider')
        ).toBeInTheDocument()
    })

    it('renders the breadcrumb items correctly with integration', () => {
        const integration = {
            name: 'New email',
            type: IntegrationType.Email,
            meta: {
                address: 'user@email.com',
            },
        } as EmailIntegration
        render(
            <BrowserRouter>
                <EmailIntegrationOnboardingBreadcrumbs
                    integration={integration}
                />
            </BrowserRouter>
        )

        // Check for static breadcrumb items
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Add email address')).toBeInTheDocument()

        // Check if integration-specific items are rendered
        expect(screen.getByText(integration.name)).toBeInTheDocument()
        expect(screen.getByText(integration.meta.address)).toBeInTheDocument()
        expect(screen.getByText(integration.meta.address)).toHaveClass(
            'emailAddress'
        )
    })
})
