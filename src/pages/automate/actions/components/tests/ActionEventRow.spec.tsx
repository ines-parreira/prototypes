import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithRouter} from 'utils/testing'
import ActionEventRow from '../ActionEventRow'

describe('<ActionEventRow />', () => {
    it('should render component', () => {
        renderWithRouter(
            <ActionEventRow
                execution={{
                    awaited_callbacks: [],
                    channel_actions: [],
                    configuration_id: '1',
                    configuration_internal_id: '1',
                    current_step_id: '1',
                    id: '1',
                    state: {
                        trigger: 'llm-prompt',
                    },
                    trigger: 'llm-prompt',
                    triggerable: false,
                }}
                isSelected={false}
                onClick={jest.fn()}
            />
        )

        expect(screen.getByText('Today at', {exact: false})).toBeInTheDocument()
    })
})
