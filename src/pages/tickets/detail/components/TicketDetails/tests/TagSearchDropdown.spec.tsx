import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {List, Map, fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClient, useQueryClient} from '@tanstack/react-query'

import {act} from 'react-dom/test-utils'
import {UserRole} from 'config/types/user'
import {agents} from 'fixtures/agents'
import useGetTags from 'hooks/tags/useGetTags'
import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import {assumeMock} from 'utils/testing'

import TagSearchDropdown from '../TagSearchDropdown'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/tags/useGetTags')
const mockUseGetTags = useGetTags as jest.Mock

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)
const removeQueriesMock = jest.fn()
useQueryClientMock.mockImplementation(
    () =>
        ({
            removeQueries: removeQueriesMock,
        } as unknown as QueryClient)
)

jest.mock('hooks/useConditionalShortcuts', () => jest.fn())
const useConditionalShortcutsMock = assumeMock(useConditionalShortcuts)

describe('<TagSearchDropdown />', () => {
    const user = fromJS(fromJS(agents[0])) as Map<any, any>
    const store = mockStore({
        currentUser: user,
    })

    const props = {
        addTag: jest.fn(),
        shouldBindKeys: false,
        ticketTags: fromJS([
            {name: 'refund'},
            {name: 'angry'},
            {name: 'return'},
            {name: 'customer'},
        ]) as List<Map<any, any>>,
    }
    beforeEach(() => {
        mockUseGetTags.mockReturnValue({
            data: {
                data: {
                    data: [
                        {id: 1, name: 'exchange'},
                        {id: 1, name: 'refund'},
                        {id: 1, name: 'return'},
                        {id: 1, name: 'product'},
                    ],
                },
            },
        })
    })

    it('should display only tags not already assigned to ticket', async () => {
        const {getByText, queryByText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )
        fireEvent.click(getByText(/Add tags/))

        await waitFor(() => {
            expect(getByText('product')).toBeInTheDocument()
            expect(getByText('exchange')).toBeInTheDocument()
            expect(queryByText('refund')).not.toBeInTheDocument()
            expect(queryByText('return')).not.toBeInTheDocument()
        })
    })

    it('should load tags', () => {
        mockUseGetTags.mockReturnValue({
            isFetching: true,
        })

        const {getByText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )

        expect(getByText('Loading...')).toBeInTheDocument()
    })

    it('should add tag to ticket', () => {
        const {getByText, getAllByRole} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )

        fireEvent.click(getByText(/Add tags/))
        fireEvent.click(getAllByRole('menuitem')[1])

        expect(props.addTag).toHaveBeenCalled()
        expect(removeQueriesMock).not.toHaveBeenCalled()
    })

    it('should abort tag addition if tag is missing a name', () => {
        mockUseGetTags.mockReturnValue({
            data: {
                data: {
                    data: [
                        {id: 1, name: ''},
                        {id: 1, name: 'refund'},
                        {id: 1, name: 'return'},
                        {id: 1, name: 'product'},
                    ],
                },
            },
        })

        const {getByText, getAllByRole} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )

        fireEvent.click(getByText(/Add tags/))
        fireEvent.click(getAllByRole('menuitem')[1])

        expect(props.addTag).not.toHaveBeenCalled()
    })

    it('should allow the tag creation to lead agent', async () => {
        mockUseGetTags.mockReturnValue({
            data: {
                data: {
                    data: [],
                },
            },
        })
        const {getByText, getByPlaceholderText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )

        fireEvent.click(getByText(/add/))
        fireEvent.change(getByPlaceholderText(/Search tags/), {
            target: {value: 'Foo'},
        })
        await waitFor(() => expect(getByText(/Create/i)).toBeTruthy())
    })

    it('should restrict the tag creation to basic agent', () => {
        mockUseGetTags.mockReturnValue({
            data: {
                data: {
                    data: [],
                },
            },
        })
        const {getByText, getByPlaceholderText, queryByText} = render(
            <Provider
                store={mockStore({
                    currentUser: user.setIn(
                        ['role', 'name'],
                        UserRole.BasicAgent
                    ),
                })}
            >
                <TagSearchDropdown {...props} />
            </Provider>
        )

        fireEvent.click(getByText(/add/))
        fireEvent.change(getByPlaceholderText(/Search tags/), {
            target: {value: 'Foo'},
        })
        expect(getByText(/Couldn't find the tag: Foo/i)).toBeInTheDocument()
        expect(queryByText(/Create Foo/i)).not.toBeInTheDocument()

        mockUseGetTags.mockReturnValue({
            data: {
                data: {
                    data: [{id: 1, name: 'Foop'}],
                },
            },
        })

        fireEvent.click(getByText(/add/))
        fireEvent.change(getByPlaceholderText(/Search tags/), {
            target: {value: 'Foo'},
        })
        expect(
            queryByText(/Couldn't find the tag: Foo/i)
        ).not.toBeInTheDocument()
        expect(queryByText(/Create Foo/i)).not.toBeInTheDocument()
    })

    it('should trigger tag request for searched term', async () => {
        const {getByText, getByPlaceholderText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )

        fireEvent.click(getByText(/add/))
        fireEvent.change(getByPlaceholderText(/Search tags/), {
            target: {value: 'Foo'},
        })

        await waitFor(() =>
            expect(mockUseGetTags).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    search: 'Foo',
                }),
                expect.objectContaining({
                    enabled: true,
                })
            )
        )
    })

    it('should remove the query for new tag', () => {
        const {getByText, getByPlaceholderText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )

        fireEvent.click(getByText(/add/))
        fireEvent.change(getByPlaceholderText(/Search tags/), {
            target: {value: 'Foo'},
        })
        fireEvent.click(getByText(/Create/i))

        expect(removeQueriesMock).toHaveBeenCalled()
    })

    it('should open and close tag dropdown by using keyboard shortcut', () => {
        const {queryByRole} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )

        act(() => {
            useConditionalShortcutsMock.mock.calls[0][2].OPEN_TAGS.action?.(
                new Event('keydown')
            )
        })

        expect(queryByRole('menu')).toBeInTheDocument()
        expect(mockUseGetTags).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({
                search: '',
            }),
            expect.objectContaining({
                enabled: true,
            })
        )

        act(() => {
            useConditionalShortcutsMock.mock.calls[0][2].CLOSE_TAGS.action?.(
                new Event('keydown')
            )
        })

        expect(queryByRole('menu')).not.toBeInTheDocument()
    })

    it('should navigate through items via keyboard event', () => {
        const {getAllByRole, getByText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )
        fireEvent.click(getByText(/add/))
        const items = getAllByRole('menuitem')

        expect(items[0]).toHaveFocus()

        fireEvent.keyDown(items[0], {
            key: 'ArrowDown',
        })
        expect(items[1]).toHaveFocus()
    })
})
