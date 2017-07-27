import React from 'react'
import {shallow} from 'enzyme'
import ConfirmButton from '../ConfirmButton'

describe('ConfirmButton component', () => {
    let component
    beforeEach(() => {
        component = shallow(
            <ConfirmButton id="1"/>
        )
    })

    it('should match snapshot', () => {
        expect(component).toMatchSnapshot()
    })

    it('should show popover on click', () => {
        component.find('#confirm-button-1').simulate('click')

        expect(component.state('showConfirmation')).toBe(true)
    })

    it('should hide popover on confirm', () => {
        component.find('[type="submit"]').simulate('click')

        expect(component.state('showConfirmation')).toBe(false)
    })
})
