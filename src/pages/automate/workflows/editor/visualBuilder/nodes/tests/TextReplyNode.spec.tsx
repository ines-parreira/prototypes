import { screen, waitFor } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<TextReplyNode />', () => {
    describe('Basic rendering', () => {
        it('should render a text reply node with content', async () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('trigger'),
                    nodeHelpers.textReply('Please enter your email', 'text1'),
                    nodeHelpers.end('end'),
                ],
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Please enter your email'),
                ).toBeInTheDocument()
            })
        })
    })
})
