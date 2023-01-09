import React from 'react'
import {render} from '@testing-library/react'

import {customField} from 'fixtures/customField'
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
    it('should render correctly', () => {
        const props = {
            ticketFields: [customField],
            onFieldChange: jest.fn(),
        }

        const {container} = render(<List {...props} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
