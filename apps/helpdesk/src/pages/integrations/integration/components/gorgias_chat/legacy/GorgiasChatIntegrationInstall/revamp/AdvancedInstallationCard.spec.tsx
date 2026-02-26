import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import AdvancedInstallationCard from './AdvancedInstallationCard'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Button: ({ children, onClick, ...props }: any) => (
        <button onClick={onClick} data-testid={props['data-testid']}>
            {children}
        </button>
    ),
    ButtonAs: { Button: 'button' },
    ButtonIntent: { Regular: 'regular' },
    ButtonVariant: { Secondary: 'secondary' },
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children, size }: any) => <h1 data-size={size}>{children}</h1>,
    Icon: ({ name }: any) => <span data-testid="icon">{name}</span>,
    Text: ({ children }: any) => <p>{children}</p>,
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/revamp/AdvancedInstallationSidePanel/AdvancedInstallationSidePanel',
    () => ({
        __esModule: true,
        default: ({ isOpen, onOpenChange, integration }: any) =>
            isOpen ? (
                <div
                    data-testid="advanced-installation-side-panel"
                    data-integration-id={integration.get('id')}
                >
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

        expect(screen.getByText('Advanced Installation')).toBeInTheDocument()
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

        const icon = screen.getByTestId('icon')
        expect(icon).toHaveTextContent('external-link')
    })

    it('should not show side panel initially', () => {
        renderComponent()

        expect(
            screen.queryByTestId('advanced-installation-side-panel'),
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
            screen.getByTestId('advanced-installation-side-panel'),
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

        const sidePanel = screen.getByTestId('advanced-installation-side-panel')
        expect(sidePanel).toHaveAttribute('data-integration-id', '1')
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
            screen.getByTestId('advanced-installation-side-panel'),
        ).toBeInTheDocument()

        const closeButton = screen.getByRole('button', { name: /close/i })
        await act(async () => {
            await user.click(closeButton)
        })

        expect(
            screen.queryByTestId('advanced-installation-side-panel'),
        ).not.toBeInTheDocument()
    })
})
