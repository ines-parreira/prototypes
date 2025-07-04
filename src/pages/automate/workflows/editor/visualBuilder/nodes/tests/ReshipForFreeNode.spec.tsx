import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<ReshipForFreeNode />', () => {
    describe('Basic rendering', () => {
        it('should render a reship for free node', () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [nodeHelpers.reshipForFree()],
            })

            expect(screen.getByText('Reship for free.')).toBeInTheDocument()
        })
    })
})
