import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<EditOrderNoteNode />', () => {
    describe('Basic rendering', () => {
        it('should render an edit order note node', () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [nodeHelpers.editOrderNote()],
            })

            expect(screen.getByText('Edit order note.')).toBeInTheDocument()
        })
    })
})
