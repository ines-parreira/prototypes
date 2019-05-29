import React from 'react'
import {fromJS} from 'immutable'
import {mount} from 'enzyme'

import {CustomerNote} from '../CustomerNote'


describe('CustomerNote component', () => {
    it('should display passed note', () => {
        const component = mount(
            <CustomerNote
                customer={fromJS({id: 1, note: 'this customer is nice'})}
                submitCustomer={jest.fn()}
                mergeTicketCustomer={jest.fn()}
            />
        )

        expect(component.children()).toMatchSnapshot()
    })

    it('should display loading state because the note is being saved', () => {
        const component = mount(
            <CustomerNote
                customer={fromJS({id: 1, note: 'this customer is nice'})}
                submitCustomer={jest.fn()}
                mergeTicketCustomer={jest.fn()}
            />
        )

        component.setState({isLoading: true})

        expect(component.children()).toMatchSnapshot()
    })

    it('should display error message because the note failed to be saved', () => {
        const component = mount(
            <CustomerNote
                customer={fromJS({id: 1, note: 'this customer is nice'})}
                submitCustomer={jest.fn()}
                mergeTicketCustomer={jest.fn()}
            />
        )

        component.setState({isError: true})

        expect(component.children()).toMatchSnapshot()
    })

    it('should mark the state as dirty because the note was changed', async () => {
        const component = mount(
            <CustomerNote
                customer={fromJS({id: 1, note: 'this customer is nice'})}
                submitCustomer={jest.fn()}
                mergeTicketCustomer={jest.fn()}
            />
        )

        const instance = component.instance()
        const newNote = 'this customer is VERY nice'

        await instance._updateNote({currentTarget: {value: newNote}})

        expect(instance.state.note).toEqual(newNote)
        expect(instance.state.isDirty).toBe(true)
    })

    it('should mark the state as not dirty and not loading because the note was successfully saved', async () => {
        const component = mount(
            <CustomerNote
                customer={fromJS({id: 1, note: 'this customer is nice'})}
                submitCustomer={() => Promise.resolve()}
                mergeTicketCustomer={jest.fn()}
            />
        )

        const instance = component.instance()
        const newNote = 'this customer is VERY nice'

        await instance._updateNote({currentTarget: {value: newNote}})

        expect(instance.state.note).toEqual(newNote)
        expect(instance.state.isDirty).toBe(true)

        await instance._submitNote()

        expect(instance.state.isDirty).toBe(false)
        expect(instance.state.isLoading).toBe(false)
    })
})
