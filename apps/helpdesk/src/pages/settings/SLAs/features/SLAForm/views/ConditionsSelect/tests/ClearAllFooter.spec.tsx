import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ClearAllFooter } from '../ClearAllFooter'
import type { ConditionsFormValue, DrilldownLevel } from '../types'
import { makeConditionItem } from '../types'

const oneCondition: ConditionsFormValue = [
    makeConditionItem('tags', 1, 'urgent', 'urgent'),
]

describe('ClearAllFooter', () => {
    it.each<[string, DrilldownLevel, ConditionsFormValue]>([
        ['root level', { type: 'root' }, oneCondition],
        ['ticket_fields level', { type: 'ticket_fields' }, oneCondition],
        ['tags level with 0 conditions', { type: 'tags' }, []],
    ])('renders nothing at %s', (_, level, conditions) => {
        const { container } = render(
            <ClearAllFooter
                level={level}
                selectedConditions={conditions}
                onClear={jest.fn()}
            />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it.each<[string, DrilldownLevel]>([
        ['tags level', { type: 'tags' }],
        [
            'ticket_field_values level',
            {
                type: 'ticket_field_values',
                fieldId: 1,
                fieldLabel: 'Priority',
                path: [],
            },
        ],
    ])('renders and fires onClear at %s', async (_, level) => {
        const user = userEvent.setup()
        const onClear = jest.fn()

        render(
            <ClearAllFooter
                level={level}
                selectedConditions={oneCondition}
                onClear={onClear}
            />,
        )

        await user.click(screen.getByText('Clear all'))
        expect(onClear).toHaveBeenCalledTimes(1)
    })
})
