import React, { ComponentProps } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { agents } from 'fixtures/agents'
import useElementSize from 'hooks/useElementSize'

import TicketTags from '../TicketTags'

const mockStore = configureMockStore([thunk])

const mockNumberOfWrappedElements = 3

jest.mock(
    'common/utils/getElementWrapInfo',
    () => () => mockNumberOfWrappedElements,
)

jest.mock('lodash/uniqueId', () => () => '42')

jest.mock('hooks/useElementSize')

const useElementSizeMock = useElementSize as jest.Mock
useElementSizeMock.mockReturnValue([160, 100])

jest.mock(
    '../TagDropdown',
    () =>
        ({ addTag }: { addTag: ({ name }: { name: string }) => void }) => (
            <div onClick={() => addTag({ name: 'mock' })}>TagDropdownMock</div>
        ),
)

describe('<TicketTags />', () => {
    const user = fromJS(fromJS(agents[0])) as Map<any, any>
    const store = mockStore({
        currentUser: user,
    })

    const minProps: Omit<ComponentProps<typeof TicketTags>, 'transparent'> = {
        addTag: jest.fn(),
        removeTag: jest.fn(),
        ticketTags: fromJS([
            { name: 'refund' },
            { name: 'angry' },
            { name: 'return' },
            { name: 'customer' },
        ]),
    }

    it('should display current tags', () => {
        const { container } = render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should allow to show and hide overflowing tags', async () => {
        const { container, getByText, getAllByText } = render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>,
        )
        const expandButton = getByText(
            new RegExp(`${mockNumberOfWrappedElements}`),
        )
        expect(container.firstChild).toHaveStyle('height: 24px')
        fireEvent.mouseOver(expandButton)
        await waitFor(() => expect(getAllByText('refund')).toHaveLength(2))
        await waitFor(() => expect(getAllByText('return')).toHaveLength(2))

        fireEvent.click(expandButton)
        expect(container.firstChild).toHaveStyle('height: 100px')
    })

    it('should add a tag', () => {
        render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('TagDropdownMock'))

        expect(minProps.addTag).toHaveBeenCalled()
    })

    it('should remove a tag', () => {
        render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>,
        )

        fireEvent.click(screen.getAllByText('close')[0])

        expect(minProps.removeTag).toHaveBeenCalledWith('angry')
    })
})
