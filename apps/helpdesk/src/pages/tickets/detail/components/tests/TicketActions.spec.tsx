import React from 'react'

import { render } from '@testing-library/react'

import { userEvent } from 'utils/testing/userEvent'

import TicketActions, { Action } from '../TicketActions'

describe('TicketActions', () => {
    it('should call the provided action when the action is clicked', () => {
        const spy = jest.fn()
        const action: Action = ['Do the thing', 'delete', spy]

        const { getByText } = render(<TicketActions actions={[action]} />)

        const actionsEl = getByText('more_vert')
        expect(actionsEl).toBeInTheDocument()

        userEvent.click(actionsEl)
        const el = getByText('Do the thing')
        expect(el).toBeInTheDocument()

        userEvent.click(el)
        expect(spy).toHaveBeenCalledTimes(1)
    })
})
