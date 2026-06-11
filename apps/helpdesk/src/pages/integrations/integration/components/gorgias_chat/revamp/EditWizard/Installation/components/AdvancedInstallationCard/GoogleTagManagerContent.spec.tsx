import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { GoogleTagManagerContent } from './GoogleTagManagerContent'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/components/revamp/CopyButton',
    () => ({
        __esModule: true,
        CopyButton: ({ value, displayText }: any) => (
            <button data-value={value}>{displayText}</button>
        ),
    }),
)

describe('GoogleTagManagerContent', () => {
    const defaultProps = {
        applicationKey: 'test-app-key-123',
        isLoadingApplicationKey: false,
    }

    const renderComponent = (
        props: Partial<typeof defaultProps> = defaultProps,
    ) => {
        return render(<GoogleTagManagerContent {...(props as any)} />)
    }

    it('should render the description text', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Google Tag Manager lets you modify libraries/snippets without touching the source code of your website or Shopify Theme.',
            ),
        ).toBeInTheDocument()
    })

    it('should render all instruction headings', () => {
        renderComponent()

        expect(screen.getAllByRole('heading')).toHaveLength(6)
    })

    it('should render first instruction', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: '1. In Google Tag Manager, click Tags in the menu.',
            }),
        ).toBeInTheDocument()
    })

    it('should render second instruction', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: '2. Click New to create a new tag.',
            }),
        ).toBeInTheDocument()
    })

    it('should render third instruction', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: '3. Search for Gorgias Chat and select it',
            }),
        ).toBeInTheDocument()
    })

    it('should render fourth instruction with app ID', () => {
        renderComponent()

        const heading = screen.getByRole('heading', {
            name: /4\. Enter your Gorgias Chat App ID:/,
        })
        expect(heading).toHaveTextContent('test-app-key-123')
    })

    it('should render fifth instruction', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: '5. Select All Pages - Page view in the Trigger section',
            }),
        ).toBeInTheDocument()
    })

    it('should render sixth instruction', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: '6. Save and publish' }),
        ).toBeInTheDocument()
    })

    it('should show loading skeleton when loading application key', () => {
        renderComponent({
            ...defaultProps,
            isLoadingApplicationKey: true,
        })

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })

    it('should not show loading skeleton when not loading', () => {
        renderComponent({
            ...defaultProps,
            isLoadingApplicationKey: false,
        })

        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })

    it('should display application key when provided', () => {
        renderComponent()

        const heading = screen.getByRole('heading', {
            name: /4\. Enter your Gorgias Chat App ID:/,
        })
        expect(heading).toHaveTextContent('test-app-key-123')
    })

    it('should show copy button when application key is provided', () => {
        renderComponent()

        const copyButton = screen.getByRole('button', { name: 'Copy ID' })
        expect(copyButton).toBeInTheDocument()
        expect(copyButton).toHaveAttribute('data-value', 'test-app-key-123')
    })

    it('should not show copy button when application key is not provided', () => {
        renderComponent({
            applicationKey: undefined,
            isLoadingApplicationKey: false,
        })

        expect(
            screen.queryByRole('button', { name: 'Copy ID' }),
        ).not.toBeInTheDocument()
    })

    it('should show error message when application key is not provided', () => {
        renderComponent({
            applicationKey: undefined,
            isLoadingApplicationKey: false,
        })

        expect(
            screen.getByRole('heading', {
                name: /Could not retrieve ID, please retry later/,
            }),
        ).toBeInTheDocument()
    })

    it('should not show error message when application key is provided', () => {
        renderComponent()

        expect(
            screen.queryByText('Could not retrieve ID, please retry later'),
        ).not.toBeInTheDocument()
    })

    it('should show loading skeleton when loading', () => {
        renderComponent({
            applicationKey: 'test-key',
            isLoadingApplicationKey: true,
        })

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })
})
