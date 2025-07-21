import { screen, waitFor } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<ConditionsNode />', () => {
    describe('Basic rendering', () => {
        it('should render with custom name', async () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger(),
                    nodeHelpers.conditions('conditions1', {
                        name: 'Check VIP Status',
                    }),
                    nodeHelpers.end(),
                ],
            })

            await waitFor(() => {
                expect(screen.getByText('Check VIP Status')).toBeInTheDocument()
            })
        })
    })
})
