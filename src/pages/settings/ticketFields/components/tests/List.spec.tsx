import React from 'react'
import {render} from '@testing-library/react'

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
        'should render correctly based on active tab',
        (canReorder) => {
            const props = {
                ticketFields: [ticketInputFieldDefinition],
                canReorder: canReorder,
                onFieldChange: jest.fn(),
                onReorder: jest.fn(),
            }

            const {container} = render(<List {...props} />)
            expect(container.firstChild).toMatchSnapshot()
        }
    )
})
