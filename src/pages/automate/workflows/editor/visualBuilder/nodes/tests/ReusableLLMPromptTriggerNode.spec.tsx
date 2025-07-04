import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<ReusableLLMPromptTriggerNode />', () => {
    describe('Basic rendering', () => {
        it('should render a reusable LLM prompt trigger node', () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [
                    nodeHelpers.reusableLLMPromptTrigger(),
                    nodeHelpers.end('end-success'),
                ],
            })

            expect(screen.getByText('start')).toBeInTheDocument()
        })
    })
})
