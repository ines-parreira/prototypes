import React from 'react'

import {fromJS} from 'immutable'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {agents} from 'fixtures/agents'

import Link from '../Link'

const mockStore = configureMockStore([thunk])

describe('<Link/>', () => {
    const props = {
        index: 2,
        targetId: 'somepath-2',
        link: {
            url: 'httpbin.org/get?first_name={{first_name}}&last_name={{last_name}}&partner={{user.name}}&agent={{current_user.name}}',
            label: 'Query {{ticket.someData}}',
        },
        source: fromJS({
            last_name: 'John',
            first_name: 'Doe',
        }),
        onRemove: jest.fn(),
        onSubmit: jest.fn(),
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render with template replaced with its according value', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {name: 'Johanna'}}),
                    ticket: fromJS({someData: '1234'}),
                    currentUser: fromJS(agents[0]),
                })}
            >
                <Link {...props} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render all agent available data', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {name: 'Johanna'}}),
                    currentUser: fromJS(agents[0]),
                })}
            >
                <Link
                    {...props}
                    link={{
                        url: 'httpbin.org/get?first_name={{current_user.firstname}}&private={{current_user.created_datetime}}',
                        label: 'Query {{current_user.has_2fa_enabled}}',
                    }}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with the editor', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Link {...props} isEditing />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should open Editor when editing a link and call onSubmit on click', async () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Link {...props} isEditing />
            </Provider>
        )
        fireEvent.click(screen.getByText('settings'))
        await waitFor(() => {
            fireEvent.click(screen.getByRole('button', {name: 'Save'}))
            expect(props.onSubmit).toHaveBeenCalledWith(props.link, props.index)
        })
    })

    it('should call onRemove when removing a link', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Link {...props} isEditing />
            </Provider>
        )
        fireEvent.click(screen.getByText('close'))
        expect(props.onRemove).toHaveBeenCalledWith(props.index)
    })
})
