import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { EmailIntegration } from '@gorgias/helpdesk-queries'

import { IntegrationType } from 'models/integration/types'
import EmailIntegrationOnboardingBreadcrumbs from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboardingBreadcrumbs'

describe('EmailIntegrationOnboardingBreadcrumbs', () => {
    it('renders the breadcrumb items correctly without integration and not forced onboarding', () => {
        render(
            <MemoryRouter>
                <EmailIntegrationOnboardingBreadcrumbs
                    integration={null}
                    isForcedEmailOnboarding={false}
                />
            </MemoryRouter>,
        )

        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Add email address')).toBeInTheDocument()
        expect(screen.getByText('Add new email')).toBeInTheDocument()

        expect(screen.getByText('Email').closest('a')).toHaveAttribute(
            'href',
            '/app/settings/channels/email',
        )
        expect(
            screen.getByText('Add email address').closest('a'),
        ).toHaveAttribute('href', '/app/settings/channels/email/new')
    })

    it('renders the breadcrumb items correctly without integration and forced onboarding', () => {
        render(
            <MemoryRouter>
                <EmailIntegrationOnboardingBreadcrumbs
                    integration={null}
                    isForcedEmailOnboarding={true}
                />
            </MemoryRouter>,
        )

        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.queryByText('Add email address')).not.toBeInTheDocument()
        expect(screen.getByText('Add new email')).toBeInTheDocument()

        expect(screen.getByText('Email').closest('a')).toHaveAttribute(
            'href',
            '/app/settings/channels/email',
        )
    })

    it('renders the breadcrumb items correctly with undefined integration', () => {
        render(
            <MemoryRouter>
                <EmailIntegrationOnboardingBreadcrumbs
                    integration={undefined}
                    isForcedEmailOnboarding={false}
                />
            </MemoryRouter>,
        )

        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Add email address')).toBeInTheDocument()
        expect(screen.getByText('Add new email')).toBeInTheDocument()
    })

    it('renders the breadcrumb items correctly with integration and not forced onboarding', () => {
        const integration = {
            name: 'New email',
            type: IntegrationType.Email,
            meta: {
                address: 'user@email.com',
            },
        } as EmailIntegration
        render(
            <MemoryRouter>
                <EmailIntegrationOnboardingBreadcrumbs
                    integration={integration}
                    isForcedEmailOnboarding={false}
                />
            </MemoryRouter>,
        )

        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Add email address')).toBeInTheDocument()

        expect(screen.getByText(integration.name)).toBeInTheDocument()
        expect(screen.getByText(integration.meta.address)).toBeInTheDocument()
        expect(screen.getByText(integration.meta.address)).toHaveClass(
            'emailAddress',
        )

        const breadcrumbInfoDiv = screen
            .getByText(integration.name)
            .closest('.breadcrumbInfo')
        expect(breadcrumbInfoDiv).toBeInTheDocument()
        expect(breadcrumbInfoDiv).toHaveClass('breadcrumbInfo')
    })

    it('renders the breadcrumb items correctly with integration and forced onboarding', () => {
        const integration = {
            name: 'New email',
            type: IntegrationType.Email,
            meta: {
                address: 'user@email.com',
            },
        } as EmailIntegration
        render(
            <MemoryRouter>
                <EmailIntegrationOnboardingBreadcrumbs
                    integration={integration}
                    isForcedEmailOnboarding={true}
                />
            </MemoryRouter>,
        )

        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.queryByText('Add email address')).not.toBeInTheDocument()

        expect(screen.getByText(integration.name)).toBeInTheDocument()
        expect(screen.getByText(integration.meta.address)).toBeInTheDocument()
        expect(screen.getByText(integration.meta.address)).toHaveClass(
            'emailAddress',
        )

        const breadcrumbInfoDiv = screen
            .getByText(integration.name)
            .closest('.breadcrumbInfo')
        expect(breadcrumbInfoDiv).toBeInTheDocument()
        expect(breadcrumbInfoDiv).toHaveClass('breadcrumbInfo')
    })
})
