import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import AnyOtherWebsiteContent from './AnyOtherWebsiteContent'

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

        expect(
            screen.getByText(
                'By inserting this snippet on your webpage, it will load the chat on that specific webpage only. Make sure to insert the snippet on all the pages for which you wish to display the chat widget.',
            ),
        ).toBeInTheDocument()
    })

    it('should render first instruction heading', () => {
        renderComponent()

        const headings = screen.getAllByRole('heading')
        expect(headings[0]).toHaveTextContent(
            '1. Edit the source code of your website and find the closing HTML tag',
        )
        expect(headings[0]).toHaveTextContent('</body>')
    })

    it('should render second instruction heading', () => {
        renderComponent()

        const headings = screen.getAllByRole('heading')
        expect(headings[1]).toHaveTextContent(
            '2. Above the </body> tag, paste the code snippet below and save changes.',
        )
    })

    it('should render headings as level 5 elements', () => {
        renderComponent()

        const headings = screen.getAllByRole('heading', { level: 5 })
        expect(headings).toHaveLength(2)
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
