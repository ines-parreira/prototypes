import React from 'react'

import { screen, waitFor } from '@testing-library/react'

import {
    edgeHelpers,
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<MultipleChoicesNode />', () => {
    describe('Basic rendering', () => {
        it('should render a multiple choices node', async () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('Trigger', 'trigger_id'),
                    nodeHelpers.choices(
                        [
                            {
                                event_id: 'event_id',
                                label: 'What would you like to do?',
                            },
                        ],
                        'Choose an option',
                        'choices_id',
                    ),
                    nodeHelpers.end(),
                ],
                edges: [edgeHelpers.simple('trigger_id', 'choices_id')],
            })
            await waitFor(() => {
                expect(screen.getByText('Choose an option')).toBeInTheDocument()
            })
        })
    })
})
