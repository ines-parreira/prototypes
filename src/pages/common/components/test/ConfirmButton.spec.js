import React from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'
import ConfirmButton from '../ConfirmButton'

describe('ConfirmButton component', () => {
    let component
    let container
    beforeEach(() => {
        component = shallow(
            <ConfirmButton id="1"/>
        )

        // reactstrap popover needs to be in the dom
        // https://github.com/reactstrap/reactstrap/issues/818
        container = document.createElement('div')
        document.body.appendChild(container)
    })

    it('should match snapshot', () => {
        expect(component).toMatchSnapshot()
    })

    it('should show popover on click', () => {
        component.find('#confirm-button-1').simulate('click', new Event('click'))

        expect(component.state('showConfirmation')).toBe(true)
    })

    it('should hide popover on confirm', () => {
        component.find('#confirm-button-1').simulate('click', new Event('click'))
        component.find('Popover Button').simulate('click')

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                expect(component.state('showConfirmation')).toBe(false)
                resolve()
            })
        })
    })

    it('should submit form', () => {
        const submit = jest.fn()
        component = mount(
            <form onSubmit={submit}>
                <ConfirmButton id="1" type="submit" skip={true} />
            </form>,
            {attachTo: container}
        )

        // enzyme doesn't support event delegation (click -> parent submit)
        // https://github.com/airbnb/enzyme/issues/308
        // use click() from jsdom
        component.find('#confirm-button-1').get(0).click()

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                expect(submit).toBeCalled()
                resolve()
            })
        })
    })
})
