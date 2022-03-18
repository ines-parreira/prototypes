import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import {UserRole} from '../../../../../../config/types/user'
import {agents} from '../../../../../../fixtures/agents'
import {TicketTags} from '../TicketTags'

describe('TicketTags component', () => {
    const user: Map<any, any> = fromJS(fromJS(agents[0]))
    const minProps: Omit<ComponentProps<typeof TicketTags>, 'transparent'> = {
        addTag: jest.fn(),
        cancelFieldEnumSearchCancellable: jest.fn(),
        fieldEnumSearchCancellable: jest.fn(() => Promise.resolve(fromJS([]))),
        removeTag: jest.fn(),
        ticketTags: fromJS([
            {name: 'refund'},
            {name: 'angry'},
            {name: 'return'},
        ]),
        currentUser: user,
        dispatch: jest.fn(),
    }

    it('should display current tags', () => {
        const {container} = render(<TicketTags {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should allow the tag creation to lead agent', async () => {
        const {getByText, getByPlaceholderText} = render(
            <TicketTags {...minProps} />
        )

        fireEvent.click(getByText(/add/))
        fireEvent.change(getByPlaceholderText(/Search tags/), {
            target: {value: 'Foo'},
        })
        await waitFor(() => expect(getByText(/Create/i)).toBeTruthy())
    })

    it('should restrict the tag creation to basic agent', async () => {
        const {getByText, getByPlaceholderText} = render(
            <TicketTags
                {...minProps}
                currentUser={user.setIn(
                    ['roles', 0, 'name'],
                    UserRole.BasicAgent
                )}
            />
        )

        fireEvent.click(getByText(/add/))
        fireEvent.change(getByPlaceholderText(/Search tags/), {
            target: {value: 'Foo'},
        })
        await waitFor(() =>
            expect(getByText(/Couldn't find the tag: Foo/i)).toBeTruthy()
        )
    })
})
