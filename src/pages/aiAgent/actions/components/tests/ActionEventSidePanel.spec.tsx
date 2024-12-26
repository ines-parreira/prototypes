import {QueryClientProvider} from '@tanstack/react-query'
import {screen} from '@testing-library/react'
import React from 'react'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import {LlmTriggeredExecution} from '../../types'
import ActionEventSidePanel from '../ActionEventSidePanel'

const queryClient = mockQueryClient()

describe('<ActionEventSidePanel />', () => {
    it('should render component', () => {
        const execution: LlmTriggeredExecution = {
            id: '1',
            state: {
                trigger: 'llm-prompt',
            },
            trigger: 'llm-prompt',
            triggerable: false,
            awaited_callbacks: [],
            channel_actions: [],
            configuration_id: '1',
            configuration_internal_id: '1',
            current_step_id: '1',
        }
        const actionConfiguration = {
            account_id: 1,
            name: 'test',
            internal_id: '1',
            id: '1',
            initial_step_id: '',
            is_draft: false,
            entrypoints: [
                {
                    kind: 'llm-conversation' as const,
                    trigger: 'llm-prompt' as const,
                    settings: {
                        instructions: 'test',
                        requires_confirmation: false,
                    },
                    deactivated_datetime: null,
                },
            ],
            triggers: [
                {
                    kind: 'llm-prompt' as const,
                    settings: {
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [],
                    },
                },
            ],
            steps: [],
            transitions: [],
            available_languages: [],
            created_datetime: new Date().toISOString(),
            updated_datetime: new Date().toISOString(),
            apps: [{type: 'app' as const, app_id: '1'}],
        }
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionEventSidePanel
                    isLoading={false}
                    isOpen={true}
                    onClose={jest.fn()}
                    execution={execution}
                    actionConfiguration={actionConfiguration}
                />
            </QueryClientProvider>
        )

        expect(screen.getByText('Event details')).toBeInTheDocument()
    })
})
