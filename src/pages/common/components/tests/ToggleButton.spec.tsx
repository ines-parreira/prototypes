import React from 'react'
import {shallow} from 'enzyme'

import ToggleButton from '../ToggleButton'

describe('ToggleButton', () => {
    const minProps = {
        onChange: jest.fn().mockResolvedValue(null),
        value: true,
    }

    it('should render the checkbox checked', () => {
        const component = shallow(<ToggleButton {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should render the checkbox unchecked', () => {
        const component = shallow(<ToggleButton {...minProps} value={false} />)

        expect(component).toMatchSnapshot()
    })

    it('should render the button loading', () => {
        const component = shallow(<ToggleButton {...minProps} loading />)

        expect(component).toMatchSnapshot()
    })

    it('should render the button disabled', () => {
        const component = shallow(<ToggleButton {...minProps} disabled />)

        expect(component).toMatchSnapshot()
    })

    it('should render the button loading and disabled', () => {
        const component = shallow(
            <ToggleButton {...minProps} loading disabled />
        )

        expect(component).toMatchSnapshot()
    })
})
