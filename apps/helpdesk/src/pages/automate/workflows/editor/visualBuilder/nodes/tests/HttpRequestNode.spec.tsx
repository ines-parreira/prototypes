import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<HttpRequestNode />', () => {
    describe('Basic rendering', () => {
        it('should render with custom URL and method', () => {
            const { container } = renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.httpRequest(
                        'https://api.myservice.com/orders',
                        'POST',
                    ),
                    nodeHelpers.end(),
                ],
            })

            const httpNode = container.querySelector(
                '[data-testid*="rf__node-"][class*="http_request"]',
            )
            expect(httpNode).toBeInTheDocument()
        })

        it('should render with all HTTP methods', () => {
            const methods: Array<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'> =
                ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

            methods.forEach((method) => {
                const { unmount, container } = renderVisualBuilder({
                    builderType: 'workflow',
                    nodes: [
                        nodeHelpers.httpRequest(
                            'https://api.example.com',
                            method,
                        ),
                        nodeHelpers.end(),
                    ],
                })

                const httpNode = container.querySelector(
                    '[class*="http_request"]',
                )
                expect(httpNode).toBeInTheDocument()
                unmount()
            })
        })
    })
})
