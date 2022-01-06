import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'

import Editor from '../Editor'

const mockStore = configureMockStore([thunk])

describe('<Editor/>', () => {
    const link = {
        url: 'httpbin.org/get?first_name={{first_name}}&last_name={{last_name}}',
        label: 'Query {{first_name}}',
    }
    const props = {
        target: 'some-id',
        onSubmit: jest.fn(),
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render nothing when popover is not open', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <button id={props.target}>Click</button>
                <Editor {...props} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should render a form when popover is open', async () => {
        render(
            <Provider store={mockStore({})}>
                <button id={props.target}>Click</button>
                <Editor {...props} />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'Click'}))
        await waitFor(() => {
            expect(screen.queryByRole('button', {name: 'Save'})).toBeTruthy()
        })
    })

    it('should render a form with prefilled data when initial link is provided', async () => {
        render(
            <Provider store={mockStore({})}>
                <button id={props.target}>Click</button>
                <Editor {...props} link={link} index={2} isEditing />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'Click'}))
        await waitFor(() => {
            expect(
                screen.queryAllByRole('textbox')[0].getAttribute('value')
            ).toBe(link.label)
        })
    })

    it('should disable Save button when invalid', async () => {
        render(
            <Provider store={mockStore({})}>
                <button id={props.target}>Click</button>
                <Editor {...props} />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'Click'}))
        await waitFor(() => {
            fireEvent.change(screen.getAllByRole('textbox')[0], {
                target: {value: ''},
            })
            expect(screen.queryByRole('button', {name: 'Save'})).toHaveProperty(
                'disabled'
            )
        })
    })

    it('should call onSubmit without an index when submitting', async () => {
        render(
            <Provider store={mockStore({})}>
                <button id={props.target}>Click</button>
                <Editor {...props} />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'Click'}))
        await screen.findByRole('button', {name: 'Save'})
        fireEvent.change(screen.getAllByRole('textbox')[0], {
            target: {value: 'ok'},
        })
        fireEvent.change(screen.getAllByRole('textbox')[1], {
            target: {value: 'okok'},
        })
        await waitFor(() => {
            expect(
                screen
                    .getByRole('button', {name: 'Save'})
                    .getAttribute('disabled')
            ).toBeFalsy()
        })
        fireEvent.click(screen.getByRole('button', {name: 'Save'}))
        expect(props.onSubmit).toHaveBeenCalledWith(
            {label: 'ok', url: 'okok'},
            undefined
        )
    })

    it('should call onSubmit with an index when submitting', async () => {
        render(
            <Provider store={mockStore({})}>
                <button id={props.target}>Click</button>
                <Editor {...props} isEditing index={2} link={link} />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'Click'}))
        await waitFor(() => {
            fireEvent.click(screen.getByRole('button', {name: 'Save'}))
            expect(props.onSubmit).toHaveBeenCalledWith(link, 2)
        })
    })
})
