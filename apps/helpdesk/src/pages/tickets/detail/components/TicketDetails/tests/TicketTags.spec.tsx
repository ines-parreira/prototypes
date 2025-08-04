import { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getWrappedElementCount } from 'common/utils'
import { agents } from 'fixtures/agents'

import TicketTags from '../TicketTags'

const mockStore = configureMockStore([thunk])

jest.mock('common/utils/getWrappedElementCount', () => jest.fn())
jest.mock('lodash/uniqueId', () => () => '42')
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useElementSize: jest.fn().mockImplementation(() => [160, 100]),
    useId: jest.fn().mockImplementation(() => '42'),
}))

const getWrappedElementCountMock = assumeMock(getWrappedElementCount)

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

    const wrappedElementCount = 3

    beforeEach(() => {
        getWrappedElementCountMock.mockReturnValue(wrappedElementCount)
    })

    const minProps: Omit<ComponentProps<typeof TicketTags>, 'transparent'> = {
        addTag: jest.fn(),
        removeTag: jest.fn(),
        ticketTags: [
            { name: 'refund', decoration: null, id: 0 },
            { name: 'angry', decoration: null, id: 1 },
            { name: 'return', decoration: null, id: 2 },
            { name: 'customer', decoration: null, id: 3 },
        ],
    }

    it('should display current tags', () => {
        render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>,
        )

        expect(screen.getByText('refund')).toBeInTheDocument()
        expect(screen.getByText('angry')).toBeInTheDocument()
        expect(screen.getByText('return')).toBeInTheDocument()
        expect(screen.getByText('customer')).toBeInTheDocument()
    })

    it('should display expand button when there are overflowing tags', () => {
        getWrappedElementCountMock.mockReturnValue(3)

        const { getByText, container } = render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>,
        )

        expect(getWrappedElementCountMock).toHaveBeenCalledWith(
            expect.anything(),
            ['button'],
        )

        expect(getByText('+ 3')).toBeInTheDocument()
        // Container should have collapsed height
        expect(container.firstChild).toHaveStyle('height: 24px')
    })

    it('should show tooltip on hover over expand button', async () => {
        // Mock wrappedElementCount to 3 (last 3 elements are wrapped)
        getWrappedElementCountMock.mockReturnValue(3)

        const { getByText, getAllByText } = render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>,
        )

        const expandButton = getByText('+ 3')

        fireEvent.mouseOver(expandButton)
        // Should show hidden tags in tooltip (last 3 tags: return, customer, refund)
        await waitFor(() => expect(getAllByText('return')).toHaveLength(2)) // One in main view, one in tooltip
        await waitFor(() => expect(getAllByText('customer')).toHaveLength(2))
        await waitFor(() => expect(getAllByText('refund')).toHaveLength(2))
    })

    it('should expand tags when expand button is clicked and show less button', () => {
        // Mock wrappedElementCount to 3 (elements are wrapping)
        getWrappedElementCountMock.mockReturnValue(3)

        const { getByText, container, queryByText } = render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>,
        )

        fireEvent.click(getByText('+ 3'))

        // Container should expand to full height
        expect(container.firstChild).toHaveStyle('height: 100px')
        expect(queryByText('+ 3')).toBeNull()
        expect(getByText('Show less')).toBeInTheDocument()
    })

    it('should collapse tags when show less button is clicked', () => {
        // Mock wrappedElementCount to 3 (elements are wrapping)
        getWrappedElementCountMock.mockReturnValue(3)

        const { getByText, container, queryByText } = render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>,
        )

        fireEvent.click(getByText('+ 3'))

        const showLessButton = getByText('Show less')
        fireEvent.click(showLessButton)

        // Container should collapse back to original height
        expect(container.firstChild).toHaveStyle('height: 24px')
        expect(queryByText('Show less')).toBeNull()
        expect(getByText('+ 3')).toBeInTheDocument()
    })

    it('should not display expand or show less buttons when there are no wrapping elements', () => {
        // Mock wrappedElementCount to 0 (no wrapping elements)
        getWrappedElementCountMock.mockReturnValue(0)

        const { queryByText } = render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>,
        )

        expect(queryByText(/^\+ \d+$/)).toBeNull()
        expect(queryByText('Show less')).toBeNull()
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
