import { screen, waitFor } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<LLMPromptTriggerNode />', () => {
    describe('Basic rendering', () => {
        it('should render an LLM prompt trigger node with default state', async () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [
                    nodeHelpers.llmPromptTrigger(),
                    nodeHelpers.end('end-success'),
                ],
            })

            await waitFor(() => {
                expect(screen.getByText('start')).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'Ask customers for information to use as variables in HTTP requests or conditions',
                    ),
                ).toBeInTheDocument()
            })
        })
    })
})
