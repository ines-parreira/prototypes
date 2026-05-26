import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import type { LlmTriggeredExecution } from '../../types'
import ActionEventsList from '../ActionEventsList'

describe('<ActionEventsList />', () => {
    it('should render component', () => {
        const execution: LlmTriggeredExecution = {
            id: '1',
            state: {
                channel: 'email',
                trigger: 'llm-prompt',
            },
            trigger: 'llm-prompt',
            triggerable: false,
            awaited_callbacks: [],
            channel_actions: [],
            configuration_id: '1',
            configuration_internal_id: '1',
            current_step_id: '1',
            input_errors: [],
            precondition_errors: [],
        }
        render(
            <ActionEventsList
                isLoading={false}
                onChangeOrder={jest.fn()}
                onSelectedExecutionIdChange={jest.fn()}
                selectedExecutionId={null}
                executions={[execution]}
            />,
        )
        expect(
            screen.getByText('Today at', { exact: false }),
        ).toBeInTheDocument()
    })
})
