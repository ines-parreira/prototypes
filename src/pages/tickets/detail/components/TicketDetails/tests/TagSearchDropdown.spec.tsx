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

jest.mock('pages/common/components/Spinner', () => () => 'SpinnerMock')

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
        jest.useFakeTimers()
        mockUseGetTags.mockReturnValue({
            data: {
                data: {
                    data: [
                        {id: 1, name: 'exchange'},
                        {id: 2, name: 'refund'},
                        {id: 3, name: 'return'},
                        {id: 4, name: 'product'},
                    ],
                },
            },
        })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should display only tags not already assigned to ticket', async () => {
        const {getByText, queryByText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )
        getByText(/Add tags/).click()

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

        getByText(/Add tags/).click()
        expect(getByText('SpinnerMock')).toBeInTheDocument()
    })

    it('should reset search on dropdown toggle', () => {
        const {getByText, getByPlaceholderText, queryByText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )

        getByText(/Add tags/).click()
        fireEvent.change(getByPlaceholderText(/Search/), {
            target: {value: 'Foo'},
        })
        act(() => jest.runAllTimers())

        expect(getByText(/Create/i)).toBeInTheDocument()

        getByText(/Add tags/).click()
        expect(queryByText(/Create/i)).not.toBeInTheDocument()
        act(() => jest.runAllTimers())

        getByText(/Add tags/).click()
        expect(getByPlaceholderText(/Search/)).toHaveValue('')
    })

    it('should add tag to ticket', () => {
        const {getByText, getAllByRole} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )

        getByText(/Add tags/).click()
        getAllByRole('listitem')[1].click()

        expect(props.addTag).toHaveBeenCalledWith('exchange')
        expect(removeQueriesMock).not.toHaveBeenCalled()
    })

    it('should abort tag addition if tag is missing a name', () => {
        mockUseGetTags.mockReturnValue({
            data: {
                data: {
                    data: [
                        {id: 1, name: ''},
                        {id: 2, name: 'refund'},
                        {id: 3, name: 'return'},
                        {id: 4, name: 'product'},
                    ],
                },
            },
        })

        const {getByText, getAllByRole} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )

        getByText(/Add tags/).click()
        getAllByRole('listitem')[1].click()

        expect(props.addTag).not.toHaveBeenCalled()
    })

    it('should allow the tag creation to lead agent', () => {
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

        getByText(/Add tags/).click()
        fireEvent.change(getByPlaceholderText(/Search/), {
            target: {value: 'Foo'},
        })
        act(() => jest.runAllTimers())

        expect(getByText(/Create/i)).toBeInTheDocument()
    })

    describe('should restrict the tag creation to basic agent', () => {
        test('when results are empty', () => {
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

            getByText(/Add tags/).click()
            fireEvent.change(getByPlaceholderText(/Search/), {
                target: {value: 'Foo'},
            })
            act(() => jest.runAllTimers())

            expect(getByText(/Couldn't find the tag: Foo/i)).toBeInTheDocument()
            expect(queryByText(/Create Foo/i)).not.toBeInTheDocument()
        })

        test('when results are not empty', () => {
            mockUseGetTags.mockReturnValue({
                data: {
                    data: {
                        data: [{id: 1, name: 'Foop'}],
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

            getByText(/Add tags/).click()
            fireEvent.change(getByPlaceholderText(/Search/), {
                target: {value: 'Foo'},
            })
            act(() => jest.runAllTimers())

            expect(
                queryByText(/Couldn't find the tag: Foo/i)
            ).not.toBeInTheDocument()
            expect(queryByText(/Create Foo/i)).not.toBeInTheDocument()
        })
    })

    it('should trigger tag request for searched term', async () => {
        const {getByText, getByPlaceholderText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )

        getByText(/Add tags/).click()
        fireEvent.change(getByPlaceholderText(/Search/), {
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

        getByText(/Add tags/).click()
        fireEvent.change(getByPlaceholderText(/Search/), {
            target: {value: 'Foo'},
        })
        act(() => jest.runAllTimers())

        getByText(/Create/i).click()

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

        expect(queryByRole('list')).toBeInTheDocument()
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

        expect(queryByRole('list')).not.toBeInTheDocument()
    })

    it('should loop through items via keyboard events', () => {
        const {getAllByRole, getByPlaceholderText, getByText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )
        getByText(/Add tags/).click()
        const searchInput = getByPlaceholderText(/Search/)
        fireEvent.change(searchInput, {
            target: {value: 'ex'},
        })
        act(() => jest.runAllTimers())

        const items = getAllByRole('listitem')

        expect(searchInput).toEqual(items[0])
        expect(searchInput).toHaveFocus()

        fireEvent.keyDown(items[0], {
            key: 'ArrowDown',
        })
        expect(getByText(/change/).parentElement).toEqual(items[1])
        expect(getByText(/change/).parentElement).toHaveFocus()

        fireEvent.keyDown(items[1], {
            key: 'ArrowDown',
        })
        expect(getByText(/Create/).parentElement).toEqual(items[2])
        expect(getByText(/Create/).parentElement).toHaveFocus()

        fireEvent.keyDown(items[2], {
            key: 'ArrowDown',
        })
        expect(searchInput).toHaveFocus()

        fireEvent.keyDown(items[0], {
            key: 'ArrowUp',
        })
        expect(getByText(/Create/).parentElement).toEqual(items[2])
        expect(getByText(/Create/).parentElement).toHaveFocus()

        fireEvent.keyDown(items[2], {
            key: 'ArrowUp',
        })
        expect(getByText(/change/).parentElement).toEqual(items[1])
        expect(getByText(/change/).parentElement).toHaveFocus()

        fireEvent.keyDown(items[1], {
            key: 'ArrowUp',
        })

        expect(searchInput).toHaveFocus()
    })

    it('should loop through items via keyboard events with empty results', () => {
        mockUseGetTags.mockReturnValue({
            data: {
                data: {
                    data: [],
                },
            },
        })

        const {getAllByRole, getByPlaceholderText, getByText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )
        getByText(/Add tags/).click()
        const searchInput = getByPlaceholderText(/Search/)
        fireEvent.change(searchInput, {
            target: {value: 'Foo'},
        })
        act(() => jest.runAllTimers())

        const items = getAllByRole('listitem')

        expect(searchInput).toEqual(items[0])
        expect(searchInput).toHaveFocus()

        fireEvent.keyDown(items[0], {
            key: 'ArrowDown',
        })
        expect(getByText(/Create/).parentElement).toEqual(items[1])
        expect(getByText(/Create/).parentElement).toHaveFocus()

        fireEvent.keyDown(items[1], {
            key: 'ArrowDown',
        })
        expect(searchInput).toEqual(items[0])
        expect(searchInput).toHaveFocus()

        fireEvent.keyDown(items[0], {
            key: 'ArrowUp',
        })
        expect(getByText(/Create/).parentElement).toEqual(items[1])
        expect(getByText(/Create/).parentElement).toHaveFocus()

        fireEvent.keyDown(items[1], {
            key: 'ArrowUp',
        })
        expect(searchInput).toEqual(items[0])
        expect(searchInput).toHaveFocus()
    })

    it('should trigger tag creation through keyboard shortcut', () => {
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

        getByText(/Add tags/).click()
        fireEvent.change(getByPlaceholderText(/Search/), {
            target: {value: 'Foo'},
        })
        act(() => jest.runAllTimers())
        fireEvent.keyDown(getByText(/Create/i), {key: 'Enter'})

        expect(props.addTag).toHaveBeenCalledWith('Foo')
    })
})
