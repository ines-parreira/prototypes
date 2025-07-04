import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<OrderSelectionNode />', () => {
    describe('Basic rendering', () => {
        it('should display content when provided', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.orderSelection('Please select your order'),
                    nodeHelpers.end(),
                ],
            })

            expect(
                screen.getByText('Please select your order'),
            ).toBeInTheDocument()
        })
    })
})
