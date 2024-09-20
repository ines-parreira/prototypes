import React from 'react'
import {screen, render} from '@testing-library/react'

import {ticketInputFieldDefinition} from 'fixtures/customField'
import List from '../List'
import {Props} from '../Row'

jest.mock('../Row', () => (props: Props) => {
    return (
        <tr>
            <td>This is a row for {props.ticketField.id}</td>
        </tr>
    )
})

describe('<List />', () => {
    it.each([true, false])(
        'should render correct number of table headers',
        (canReorder) => {
            const props = {
                ticketFields: [ticketInputFieldDefinition],
                canReorder: canReorder,
                onFieldChange: jest.fn(),
                onReorder: jest.fn(),
            }

            render(<List {...props} />)

            expect(screen.getAllByRole('columnheader')).toHaveLength(
                canReorder ? 5 : 4
            )
        }
    )
})
