import React from 'react'
import {render} from 'enzyme'

import Popover from './Popover'

describe('<Popover />', () => {
    it('should render ', () => {
        const component = render(<Popover />)
        expect(component).toMatchSnapshot()
    })
})
