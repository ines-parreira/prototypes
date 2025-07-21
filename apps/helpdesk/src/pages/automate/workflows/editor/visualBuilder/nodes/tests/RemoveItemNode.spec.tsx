import { screen, waitFor } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<RemoveItemNode />', () => {
    describe('Basic rendering', () => {
        it('should render a remove item node', async () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [
                    nodeHelpers.removeItem('remove1'),
                    nodeHelpers.end('end'),
                ],
            })

            await waitFor(() => {
                expect(screen.getByText('Remove item.')).toBeInTheDocument()
            })
        })
    })
})
