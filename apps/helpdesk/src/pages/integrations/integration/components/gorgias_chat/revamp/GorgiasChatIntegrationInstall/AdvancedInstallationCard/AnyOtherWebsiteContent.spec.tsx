import { render, screen } from '@testing-library/react'

import AnyOtherWebsiteContent from './AnyOtherWebsiteContent'

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
    'pages/integrations/integration/components/gorgias_chat/legacy/components/revamp/CodeSnippet',
    () => ({
        __esModule: true,
        default: ({ codeSnippet, withCopyButton }: any) => (
            <div data-testid="code-snippet">
                <div data-testid="code-snippet-content">{codeSnippet}</div>
                <div data-testid="code-snippet-copy-button">
                    {withCopyButton.toString()}
                </div>
            </div>
        ),
    }),
)

describe('AnyOtherWebsiteContent', () => {
    const defaultProps = {
        installationCode: '<script>console.log("test")</script>',
        isLoadingInstallationCode: false,
    }

    const renderComponent = (
        props: Partial<typeof defaultProps> = defaultProps,
    ) => {
        return render(<AnyOtherWebsiteContent {...(props as any)} />)
    }

    it('should render the description text', () => {
        renderComponent()

        expect(screen.getByTestId('text')).toHaveTextContent(
            'By inserting this snippet on your webpage, it will load the chat on that specific webpage only. Make sure to insert the snippet on all the pages for which you wish to display the chat widget.',
        )
    })

    it('should render first instruction heading', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[0]).toHaveTextContent(
            '1. Edit the source code of your website and find the closing HTML tag',
        )
        expect(headings[0]).toHaveTextContent('</body>')
    })

    it('should render second instruction heading', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[1]).toHaveTextContent(
            '2. Above the </body> tag, paste the code snippet below and save changes.',
        )
    })

    it('should render headings with correct size', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[0]).toHaveAttribute('data-size', 'sm')
        expect(headings[1]).toHaveAttribute('data-size', 'sm')
    })

    it('should show loading skeleton when loading', () => {
        renderComponent({
            ...defaultProps,
            isLoadingInstallationCode: true,
        })

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })

    it('should not show loading skeleton when not loading', () => {
        renderComponent({
            ...defaultProps,
            isLoadingInstallationCode: false,
        })

        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })

    it('should render code snippet when installation code is provided', () => {
        renderComponent()

        expect(screen.getByTestId('code-snippet')).toBeInTheDocument()
    })

    it('should not render code snippet when no installation code', () => {
        renderComponent({
            isLoadingInstallationCode: false,
        })

        expect(screen.queryByTestId('code-snippet')).not.toBeInTheDocument()
    })

    it('should pass trimmed installation code to code snippet', () => {
        renderComponent({
            ...defaultProps,
            installationCode: '  <script>console.log("test")</script>  ',
        })

        const codeContent = screen.getByTestId('code-snippet-content')
        expect(codeContent).toHaveTextContent(
            '<script>console.log("test")</script>',
        )
    })

    it('should pass withCopyButton prop to code snippet', () => {
        renderComponent()

        const copyButton = screen.getByTestId('code-snippet-copy-button')
        expect(copyButton).toHaveTextContent('true')
    })

    it('should not show code snippet when loading', () => {
        renderComponent({
            isLoadingInstallationCode: true,
        })

        expect(screen.queryByTestId('code-snippet')).not.toBeInTheDocument()
    })
})
