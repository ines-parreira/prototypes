import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {Map, fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {agents} from 'fixtures/agents'
import useElementSize from 'hooks/useElementSize'

import TicketTags from '../TicketTags'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/useElementSize')

const mockNumberOfWrappedElements = 3

jest.mock('hooks/useHasWrapped', () => () => ({
    ref: {current: null},
    hasWrapped: true,
    numberOfWrappedElements: mockNumberOfWrappedElements,
    width: 100,
}))

const useElementSizeMock = useElementSize as jest.Mock
useElementSizeMock.mockReturnValue([160, 100])

describe('<TicketTags />', () => {
    const user = fromJS(fromJS(agents[0])) as Map<any, any>
    const store = mockStore({
        currentUser: user,
    })

    const minProps: Omit<ComponentProps<typeof TicketTags>, 'transparent'> = {
        addTag: jest.fn(),
        removeTag: jest.fn(),
        ticketTags: fromJS([
            {name: 'refund'},
            {name: 'angry'},
            {name: 'return'},
            {name: 'customer'},
        ]),
    }

    it('should display current tags', () => {
        const {container} = render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should allow to show and hide overflowing tags', async () => {
        const {container, getByText, getAllByText} = render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>
        )
        const expandButton = getByText(
            new RegExp(`${mockNumberOfWrappedElements - 1}`)
        )
        expect(container.firstChild).toHaveStyle('height: 24px')
        fireEvent.mouseOver(expandButton)
        await waitFor(() => expect(getAllByText('refund')).toHaveLength(2))
        await waitFor(() => expect(getAllByText('return')).toHaveLength(2))

        fireEvent.click(expandButton)
        expect(container.firstChild).toHaveStyle('height: 100px')
    })
})
