import React from 'react'
import {shallow} from 'enzyme'

import ToggleButton from '../ToggleButton'

describe('ToggleButton', () => {
    it('should render the checkbox checked', () => {
        const component = shallow(<ToggleButton value={true} />)

        expect(component).toMatchSnapshot()
    })

    it('should render the checkbox unchecked', () => {
        const component = shallow(<ToggleButton value={false} />)

        expect(component).toMatchSnapshot()
    })

    it('should render the button loading', () => {
        const component = shallow(<ToggleButton value={true} loading />)

        expect(component).toMatchSnapshot()
    })

    it('should render the button disabled', () => {
        const component = shallow(<ToggleButton value={true} disabled />)

        expect(component).toMatchSnapshot()
    })

    it('should render the button loading and disabled', () => {
        const component = shallow(
            <ToggleButton value={true} loading disabled />
        )

        expect(component).toMatchSnapshot()
    })
})
