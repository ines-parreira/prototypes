import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'

import ApplyMacro from '../ApplyMacro'
import BulkActions from '../BulkActions'
import CloseTickets from '../CloseTickets'

jest.mock(
    '../ApplyMacro',
    () =>
        ({onComplete}: ComponentProps<typeof ApplyMacro>) =>
            <div onClick={onComplete}>ApplyMacro</div>
)

jest.mock(
    '../CloseTickets',
    () =>
        ({onComplete}: ComponentProps<typeof CloseTickets>) =>
            <div onClick={onComplete}>CloseTickets</div>
)

describe('<BulkActions />', () => {
    const minProps = {
        onComplete: jest.fn(),
        selectedTickets: {},
    }

    it('should clear selected tickets once `close ticket` bulk action is applied', () => {
        const {getByText} = render(<BulkActions {...minProps} />)
        getByText('CloseTickets').click()

        expect(minProps.onComplete).toHaveBeenCalled()
    })

    it('should clear selected tickets once `apply macro` bulk action is applied', () => {
        const {getByText} = render(<BulkActions {...minProps} />)
        fireEvent.click(getByText('ApplyMacro'))

        expect(minProps.onComplete).toHaveBeenCalled()
    })
})
