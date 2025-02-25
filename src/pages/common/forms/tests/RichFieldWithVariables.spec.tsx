import React from 'react'

import { render } from '@testing-library/react'
import _noop from 'lodash/noop'

import RichFieldWithVariables from '../RichFieldWithVariables'

jest.mock('../RichField/TicketRichField', () => () => <div></div>)

describe('RichFieldWithVariables', () => {
    it('should render an input with variable dropdowns', () => {
        const { container } = render(
            <RichFieldWithVariables
                value={{ text: 'text', html: 'html' }}
                onChange={_noop}
                variableTypes={['ticket.customer', 'current_user']}
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
