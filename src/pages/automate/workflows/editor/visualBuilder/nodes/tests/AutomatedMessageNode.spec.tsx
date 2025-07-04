import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<AutomatedMessageNode />', () => {
    describe('Basic rendering', () => {
        it('should render a simple automated message node', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger(),
                    nodeHelpers.message('Hello customer!'),
                    nodeHelpers.end(),
                ],
            })

            expect(screen.getByText('Hello customer!')).toBeInTheDocument()
        })
    })
})
