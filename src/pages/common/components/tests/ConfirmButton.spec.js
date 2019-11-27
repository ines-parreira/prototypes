import React from 'react'
import {shallow, mount} from 'enzyme'

import ConfirmButton from '../ConfirmButton'

describe('ConfirmButton component', () => {
    it('should match snapshot', () => {
        const component = shallow(
            <ConfirmButton id="1"/>
        )

        expect(component).toMatchSnapshot()
    })

    it('should show popover on click', () => {
        const component = shallow(
            <ConfirmButton id="1"/>
        )
        component.find('#confirm-button-1').simulate('click', new Event('click'))

        expect(component.state('showConfirmation')).toBe(true)
    })

    it('should hide popover on confirm', () => {
        const component = shallow(
            <ConfirmButton id="1"/>
        )
        component.find('#confirm-button-1').simulate('click', new Event('click'))
        component.find('Popover Button').simulate('click')

        return new Promise((resolve) => {
            setTimeout(() => {
                expect(component.state('showConfirmation')).toBe(false)
                resolve()
            })
        })
    })

    it('should submit form', () => {
        // reactstrap popover needs to be in the dom
        // https://github.com/reactstrap/reactstrap/issues/818
        const container = document.createElement('div')
        document.body.appendChild(container)
        const submit = jest.fn()
        const component = mount(
            <form onSubmit={submit}>
                <ConfirmButton
                    id="1"
                    type="submit"
                    skip={true}
                />
            </form>,
            {attachTo: container}
        )

        component.find('button#confirm-button-1').simulate('submit')

        return new Promise((resolve) => {
            setTimeout(() => {
                expect(submit).toBeCalled()
                resolve()
            })
        })
    })

    it('should have loading state', () => {
        const component = shallow(
            <ConfirmButton
                id="1"
                loading
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should have loading state on confirm', () => {
        const confirm = () => new Promise((resolve) => setTimeout(resolve, 10))
        const component = shallow(
            <ConfirmButton
                id="1"
                confirm={confirm}
            />
        )
        component.find('Button').last().simulate('click')

        return new Promise((resolve) => {
            setTimeout(() => {
                expect(component.find('Button').first().hasClass('btn-loading')).toBe(true)
                resolve()
            })
        })
    })

    it('should not have loading state on confirm done', () => {
        const confirm = jest.fn()
        const component = shallow(
            <ConfirmButton
                id="1"
                confirm={confirm}
            />
        )
        component.find('Button').last().simulate('click')

        return new Promise((resolve) => {
            setTimeout(() => {
                expect(confirm).toHaveBeenCalled()
                expect(component.find('Button').first().hasClass('btn-loading')).toBe(false)
                resolve()
            }, 10)
        })
    })
})
