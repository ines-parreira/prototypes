import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { AdvancedInstallationCard } from './AdvancedInstallationCard'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Installation/components/AdvancedInstallationCard/AdvancedInstallationSidePanel',
    () => ({
        __esModule: true,
        AdvancedInstallationSidePanel: ({
            isOpen,
            onOpenChange,
            integration,
        }: any) =>
            isOpen ? (
                <div role="dialog" aria-label="Advanced Installation Panel">
                    <p>Integration {integration.get('id')}</p>
                    <button onClick={() => onOpenChange(false)}>Close</button>
                </div>
            ) : null,
    }),
)

describe('AdvancedInstallationCard', () => {
    const defaultIntegration = fromJS({
        id: 1,
        meta: {
            app_id: 'test-app-id',
        },
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (integration = defaultIntegration) => {
        return render(<AdvancedInstallationCard integration={integration} />)
    }

    it('should render the card with heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Advanced Installation' }),
        ).toBeInTheDocument()
    })

    it('should render the description text', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Manually install the chat widget on non-Shopify sites, Shopify Headless, or specific Shopify pages.',
            ),
        ).toBeInTheDocument()
    })

    it('should render the install with code button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /install with code/i }),
        ).toBeInTheDocument()
    })

    it('should render the learn more link with correct href', () => {
        renderComponent()

        const learnMoreLink = screen.getByRole('link', { name: /learn more/i })
        expect(learnMoreLink).toBeInTheDocument()
        expect(learnMoreLink).toHaveAttribute(
            'href',
            'https://docs.gorgias.com/en-US/configure-chat-for-your-gorgias-helpdesk-81789',
        )
        expect(learnMoreLink).toHaveAttribute('target', '_blank')
    })

    it('should render external link icon', () => {
        renderComponent()

        expect(
            screen.getByRole('img', { name: 'external-link' }),
        ).toBeInTheDocument()
    })

    it('should not show side panel initially', () => {
        renderComponent()

        expect(
            screen.queryByRole('dialog', {
                name: 'Advanced Installation Panel',
            }),
        ).not.toBeInTheDocument()
    })

    it('should open side panel when install with code button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const installButton = screen.getByRole('button', {
            name: /install with code/i,
        })
        await act(async () => {
            await user.click(installButton)
        })

        expect(
            screen.getByRole('dialog', {
                name: 'Advanced Installation Panel',
            }),
        ).toBeInTheDocument()
    })

    it('should pass integration to side panel', async () => {
        const user = userEvent.setup()
        renderComponent()

        const installButton = screen.getByRole('button', {
            name: /install with code/i,
        })
        await act(async () => {
            await user.click(installButton)
        })

        expect(screen.getByText('Integration 1')).toBeInTheDocument()
    })

    it('should close side panel when onOpenChange is called with false', async () => {
        const user = userEvent.setup()
        renderComponent()

        const installButton = screen.getByRole('button', {
            name: /install with code/i,
        })
        await act(async () => {
            await user.click(installButton)
        })

        expect(
            screen.getByRole('dialog', {
                name: 'Advanced Installation Panel',
            }),
        ).toBeInTheDocument()

        const closeButton = screen.getByRole('button', { name: /close/i })
        await act(async () => {
            await user.click(closeButton)
        })

        expect(
            screen.queryByRole('dialog', {
                name: 'Advanced Installation Panel',
            }),
        ).not.toBeInTheDocument()
    })
})
