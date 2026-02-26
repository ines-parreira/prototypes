import { render, screen } from '@testing-library/react'

import CodeSnippet from './CodeSnippet'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/components/revamp/CopyButton',
    () => ({
        __esModule: true,
        default: ({
            value,
            displayText,
        }: {
            value: string
            displayText: string
        }) => (
            <button data-value={value} aria-label={displayText}>
                {displayText}
            </button>
        ),
    }),
)

describe('CodeSnippet', () => {
    const mockCodeSnippet = '<script>console.log("Hello World")</script>'

    describe('code snippet rendering', () => {
        it('should render the code snippet', () => {
            render(<CodeSnippet codeSnippet={mockCodeSnippet} />)

            expect(screen.getByText(mockCodeSnippet)).toBeInTheDocument()
        })

        it('should render code snippet in a pre and code element', () => {
            const { container } = render(
                <CodeSnippet codeSnippet={mockCodeSnippet} />,
            )

            const preElement = container.querySelector('pre')
            const codeElement = container.querySelector('code')

            expect(preElement).toBeInTheDocument()
            expect(codeElement).toBeInTheDocument()
            expect(codeElement?.textContent).toBe(mockCodeSnippet)
        })
    })

    describe('copy button rendering', () => {
        it('should render copy button when withCopyButton is true', () => {
            render(
                <CodeSnippet
                    codeSnippet={mockCodeSnippet}
                    withCopyButton={true}
                />,
            )

            const copyButton = screen.getByRole('button', {
                name: /copy code/i,
            })
            expect(copyButton).toBeInTheDocument()
        })

        it('should not render copy button when withCopyButton is false', () => {
            render(
                <CodeSnippet
                    codeSnippet={mockCodeSnippet}
                    withCopyButton={false}
                />,
            )

            const copyButton = screen.queryByRole('button', {
                name: /copy code/i,
            })
            expect(copyButton).not.toBeInTheDocument()
        })

        it('should not render copy button when withCopyButton is not provided', () => {
            render(<CodeSnippet codeSnippet={mockCodeSnippet} />)

            const copyButton = screen.queryByRole('button', {
                name: /copy code/i,
            })
            expect(copyButton).not.toBeInTheDocument()
        })

        it('should pass code snippet value to copy button', () => {
            render(
                <CodeSnippet
                    codeSnippet={mockCodeSnippet}
                    withCopyButton={true}
                />,
            )

            const copyButton = screen.getByRole('button', {
                name: /copy code/i,
            })
            expect(copyButton).toHaveAttribute('data-value', mockCodeSnippet)
        })
    })
})
