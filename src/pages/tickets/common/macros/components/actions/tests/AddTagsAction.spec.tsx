import {fireEvent, render} from '@testing-library/react'
import {List, fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import useElementSize from 'hooks/useElementSize'
import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

import AddTagsAction from '../AddTagsAction'

jest.mock('pages/tickets/detail/components/TicketDetails/TicketTags')
const mockedTicketTags = assumeMock(TicketTags)

jest.mock('hooks/useElementSize', () => jest.fn())
jest.mock(
    'pages/tickets/detail/components/TicketDetails/TagDropdown',
    () => () => 'TagDropdownMock'
)

const useElementSizeMock = useElementSize as jest.Mock
useElementSizeMock.mockReturnValue([0, 160])

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({} as RootState)

describe('<AddTagsAction />', () => {
    const tag1 = 'tag1'
    const tag2 = 'tag2'

    const props = {
        index: 0,
        args: fromJS({tags: [tag1, tag2].join(',')}),
        updateActionArgs: jest.fn(),
    }

    beforeEach(() => {
        /* eslint-disable  @typescript-eslint/no-unsafe-member-access */
        mockedTicketTags.mockImplementation(
            jest.requireActual(
                'pages/tickets/detail/components/TicketDetails/TicketTags'
            ).default
        )
        /* eslint-enable */
    })

    it('should render the tag dropdown to add tags', () => {
        const {getByText} = render(
            <Provider store={store}>
                <AddTagsAction {...props} />
            </Provider>
        )

        expect(getByText('TagDropdownMock')).toBeInTheDocument()
        expect(getByText(tag1)).toBeInTheDocument()
        expect(getByText(tag2)).toBeInTheDocument()
    })

    it('should pass down ticket tags', () => {
        mockedTicketTags.mockImplementation(
            ({ticketTags}: {ticketTags: List<any>}) => (
                <div>{JSON.stringify(ticketTags.toJS())}</div>
            )
        )

        const {getByText} = render(
            <Provider store={store}>
                <AddTagsAction {...props} />
            </Provider>
        )

        expect(
            getByText(JSON.stringify([tag1, tag2].map((tag) => ({name: tag}))))
        ).toBeInTheDocument()
    })

    it('should add tag', () => {
        const newTag = 'new tag'

        mockedTicketTags.mockImplementation(
            ({addTag}: {addTag?: (tag: string) => void}) => (
                <div onClick={() => addTag?.(newTag)}>TicketTagsMock</div>
            )
        )

        const {getByText} = render(
            <Provider store={store}>
                <AddTagsAction {...props} />
            </Provider>
        )

        fireEvent.click(getByText('TicketTagsMock'))

        expect(props.updateActionArgs).toHaveBeenCalledWith(
            props.index,
            fromJS({tags: [tag1, tag2, newTag].join(',')})
        )
    })

    it('should remove tag', () => {
        const removedTag = 'tag1'

        mockedTicketTags.mockImplementation(
            ({removeTag}: {removeTag?: (tag: string) => void}) => (
                <div onClick={() => removeTag?.(removedTag)}>
                    TicketTagsMock
                </div>
            )
        )

        const {getByText} = render(
            <Provider store={store}>
                <AddTagsAction {...props} />
            </Provider>
        )

        fireEvent.click(getByText('TicketTagsMock'))

        expect(props.updateActionArgs).toHaveBeenCalledWith(
            props.index,
            fromJS({tags: tag2})
        )
    })
})
