import { render, screen } from '@testing-library/react'

import GoogleTagManagerContent from './GoogleTagManagerContent'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Text: ({ children }: any) => <p data-testid="text">{children}</p>,
    Heading: ({ children, size }: any) => (
        <h2 data-testid="heading" data-size={size}>
            {children}
        </h2>
    ),
    HeadingSize: {
        Sm: 'sm',
    },
    Skeleton: ({ width }: any) => (
        <div data-testid="skeleton" aria-label="Loading" data-width={width} />
    ),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/components/revamp/CopyButton',
    () => ({
        __esModule: true,
        default: ({ value, displayText }: any) => (
            <button data-testid="copy-button" data-value={value}>
                {displayText}
            </button>
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

        expect(screen.getByTestId('text')).toHaveTextContent(
            'Google Tag Manager lets you modify libraries/snippets without touching the source code of your website or Shopify Theme.',
        )
    })

    it('should render all instruction headings', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings).toHaveLength(6)
    })

    it('should render first instruction', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[0]).toHaveTextContent(
            '1. In Google Tag Manager, click Tags in the menu.',
        )
    })

    it('should render second instruction', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[1]).toHaveTextContent(
            '2. Click New to create a new tag.',
        )
    })

    it('should render third instruction', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[2]).toHaveTextContent(
            '3. Search for Gorgias Chat and select it',
        )
    })

    it('should render fourth instruction with app ID', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[3]).toHaveTextContent(
            '4. Enter your Gorgias Chat App ID:',
        )
        expect(headings[3]).toHaveTextContent('test-app-key-123')
    })

    it('should render fifth instruction', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[4]).toHaveTextContent(
            '5. Select All Pages - Page view in the Trigger section',
        )
    })

    it('should render sixth instruction', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[5]).toHaveTextContent('6. Save and publish')
    })

    it('should render headings with correct size', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        headings.forEach((heading) => {
            expect(heading).toHaveAttribute('data-size', 'sm')
        })
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

        const headings = screen.getAllByTestId('heading')
        expect(headings[3]).toHaveTextContent('test-app-key-123')
    })

    it('should show copy button when application key is provided', () => {
        renderComponent()

        const copyButton = screen.getByTestId('copy-button')
        expect(copyButton).toBeInTheDocument()
        expect(copyButton).toHaveTextContent('Copy ID')
        expect(copyButton).toHaveAttribute('data-value', 'test-app-key-123')
    })

    it('should not show copy button when application key is not provided', () => {
        renderComponent({
            applicationKey: undefined,
            isLoadingApplicationKey: false,
        })

        expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument()
    })

    it('should show error message when application key is not provided', () => {
        renderComponent({
            applicationKey: undefined,
            isLoadingApplicationKey: false,
        })

        const headings = screen.getAllByTestId('heading')
        expect(headings[3]).toHaveTextContent(
            'Could not retrieve ID, please retry later',
        )
    })

    it('should not show error message when application key is provided', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[3]).not.toHaveTextContent(
            'Could not retrieve ID, please retry later',
        )
    })

    it('should show loading skeleton when loading', () => {
        renderComponent({
            applicationKey: 'test-key',
            isLoadingApplicationKey: true,
        })

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })
})
