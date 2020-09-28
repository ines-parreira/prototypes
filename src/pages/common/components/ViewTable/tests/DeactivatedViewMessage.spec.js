import React from 'react'
import {render} from 'enzyme'

import DeactivatedViewMessage from '../DeactivatedViewMessage.tsx'

describe('<DeactivatedViewMessage/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const component = render(<DeactivatedViewMessage />)
            expect(component).toMatchSnapshot()
        })
    })
})
