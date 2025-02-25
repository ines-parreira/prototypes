import React from 'react'

import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { LlmTriggeredExecution } from '../../types'
import ActionEventsList from '../ActionEventsList'

describe('<ActionEventsList />', () => {
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
        renderWithRouter(
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
