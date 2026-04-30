import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ClearAllFooter } from '../ClearAllFooter'
import type { ConditionsFormValue } from '../types'
import { makeConditionItem } from '../types'

const oneCondition: ConditionsFormValue = [
    makeConditionItem('tags', 1, 'urgent', 'urgent'),
]

describe('ClearAllFooter', () => {
    it('renders nothing with 0 conditions', () => {
        const { container } = render(
            <ClearAllFooter selectedConditions={[]} onClear={jest.fn()} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders and fires onClear with selected conditions', async () => {
        const user = userEvent.setup()
        const onClear = jest.fn()

        render(
            <ClearAllFooter
                selectedConditions={oneCondition}
                onClear={onClear}
            />,
        )

        await user.click(screen.getByText('Clear all'))
        expect(onClear).toHaveBeenCalledTimes(1)
    })
})
