import { render, screen } from '@testing-library/react'

import ShopifyWebsiteContent from './ShopifyWebsiteContent'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Text: ({ children, size, color }: any) => (
        <p data-testid="text" data-size={size} data-color={color}>
            {children}
        </p>
    ),
    Heading: ({ children, size }: any) => (
        <h2 data-testid="heading" data-size={size}>
            {children}
        </h2>
    ),
    HeadingSize: {
        Sm: 'sm',
    },
    Image: ({ src, alt, fallback }: any) => (
        <div data-testid="image">
            <img src={src} alt={alt} />
            {fallback && <div data-testid="image-fallback">{fallback}</div>}
        </div>
    ),
    Box: ({ children, alignItems, justifyContent, className }: any) => (
        <div
            data-testid="box"
            data-align-items={alignItems}
            data-justify-content={justifyContent}
            className={className}
        >
            {children}
        </div>
    ),
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

jest.mock('assets/img/chat-settings/edit-code.png', () => 'edit-code.png')
jest.mock('assets/img/chat-settings/find-body.png', () => 'find-body.png')
jest.mock(
    'assets/img/chat-settings/search-for-themes.png',
    () => 'search-for-themes.png',
)

describe('ShopifyWebsiteContent', () => {
    const defaultProps = {
        installationCode: '<script>console.log("test")</script>',
        isLoadingInstallationCode: false,
    }

    const renderComponent = (
        props: Partial<typeof defaultProps> = defaultProps,
    ) => {
        return render(<ShopifyWebsiteContent {...(props as any)} />)
    }

    it('should render the description text', () => {
        renderComponent()

        const textElements = screen.getAllByTestId('text')
        const descriptionText = textElements.find((el) =>
            el.textContent?.includes('By copying the code to your Shopify'),
        )
        expect(descriptionText).toHaveTextContent(
            'By copying the code to your Shopify theme.liquid files, the chat will also be shown on all webpages. Make sure to copy the code to just specific pages if needed.',
        )
    })

    it('should render all instruction headings', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings).toHaveLength(4)
    })

    it('should render first instruction', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[0]).toHaveTextContent(
            "1. Go to your store's admin panel and search for Themes",
        )
    })

    it('should render second instruction', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[1]).toHaveTextContent(
            '2. Click the three-dot menu next to Customize, then click "Edit code".',
        )
    })

    it('should render third instruction', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[2]).toHaveTextContent(
            '3. Open file theme.liquid, scroll down to the bottom and find the',
        )
        expect(headings[2]).toHaveTextContent('</body>')
    })

    it('should render fourth instruction', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        expect(headings[3]).toHaveTextContent(
            '4. Paste the code below directly above the',
        )
        expect(headings[3]).toHaveTextContent('</body>')
    })

    it('should render headings with correct size', () => {
        renderComponent()

        const headings = screen.getAllByTestId('heading')
        headings.forEach((heading) => {
            expect(heading).toHaveAttribute('data-size', 'sm')
        })
    })

    it('should render images for all instructions', () => {
        renderComponent()

        const images = screen.getAllByTestId('image')
        expect(images).toHaveLength(3)
    })

    it('should render first instruction image with correct alt text', () => {
        renderComponent()

        const images = screen.getAllByTestId('image')
        const img = images[0].querySelector('img')
        expect(img).toHaveAttribute('alt', 'Search for theme instruction')
    })

    it('should render second instruction image with correct alt text', () => {
        renderComponent()

        const images = screen.getAllByTestId('image')
        const img = images[1].querySelector('img')
        expect(img).toHaveAttribute('alt', 'Edit code instruction')
    })

    it('should render third instruction image with correct alt text', () => {
        renderComponent()

        const images = screen.getAllByTestId('image')
        const img = images[2].querySelector('img')
        expect(img).toHaveAttribute('alt', 'Find body instruction')
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

    it('should render images with fallback components', () => {
        renderComponent()

        const images = screen.getAllByTestId('image')
        images.forEach((image) => {
            expect(
                image.querySelector('[data-testid="image-fallback"]'),
            ).toBeInTheDocument()
        })
    })
})
