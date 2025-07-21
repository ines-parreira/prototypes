import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<ReplaceItemNode />', () => {
    describe('Basic rendering', () => {
        it('should render a replace item node', () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [nodeHelpers.replaceItem(), nodeHelpers.end()],
            })

            expect(screen.getByText('Replace item.')).toBeInTheDocument()
        })
    })
})
