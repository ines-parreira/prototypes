import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {act, fireEvent, render, waitFor} from '@testing-library/react'
import _keyBy from 'lodash/keyBy'
import {Action} from 'redux'

import DEPRECATED_TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {initialState, mergeStatsFilters} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {fetchTags} from 'models/tag/resources'
import {TagSortableProperties} from 'models/tag/types'
import {OrderDirection} from 'models/api/types'
import * as tagsActions from 'state/entities/tags/actions'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import {tags as tagsFixtures} from 'fixtures/tag'

jest.mock('models/tag/resources')
jest.mock(
    'pages/common/components/InfiniteScroll/InfiniteScroll',
    () =>
        ({onLoad, children}: ComponentProps<typeof InfiniteScroll>) => {
            return (
                <div onClick={onLoad} data-testid="infinite-container">
                    {children}
                </div>
            )
        }
)

const mockStore = configureMockStore([thunk])
const fetchTagsMock = fetchTags as jest.MockedFunction<typeof fetchTags>
let tagsFetchedSpy: jest.SpiedFunction<typeof tagsActions.tagsFetched>

describe('DEPRECATED_TagsStatsFilter', () => {
    const defaultState = {
        stats: initialState,
        entities: {
            tags: _keyBy(tagsFixtures, (tag) => tag.id),
        } as unknown as RootState['entities'],
    } as RootState

    beforeEach(() => {
        tagsFetchedSpy = jest.spyOn(tagsActions, 'tagsFetched')

        fetchTagsMock.mockResolvedValue(
            axiosSuccessResponse({
                uri: '/api/tags/',
                data: tagsFixtures,
                meta: {
                    next_cursor: null,
                    prev_cursor: null,
                },
                object: 'list',
            })
        )
    })

    afterEach(() => {
        tagsFetchedSpy.mockRestore()
    })

    it('should render the selected tags', async () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <DEPRECATED_TagsStatsFilter
                    value={[tagsFixtures[0].id, tagsFixtures[2].id]}
                />
            </Provider>
        )

        await waitFor(() =>
            expect(tagsFetchedSpy).toHaveBeenCalledWith(tagsFixtures)
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with no selected tags', async () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <DEPRECATED_TagsStatsFilter value={undefined} />
            </Provider>
        )

        await waitFor(() =>
            expect(tagsFetchedSpy).toHaveBeenCalledWith(tagsFixtures)
        )

        expect(container.firstChild).not.toBeEmptyDOMElement()
    })

    it('should merge stats filters on item select', async () => {
        const store = mockStore(defaultState)
        const {getByLabelText} = render(
            <Provider store={store}>
                <DEPRECATED_TagsStatsFilter value={[]} />
            </Provider>
        )

        await waitFor(() =>
            expect(tagsFetchedSpy).toHaveBeenCalledWith(tagsFixtures)
        )
        fireEvent.click(getByLabelText(tagsFixtures[0].name))

        const mergeStatsFiltersActions = store
            .getActions()
            .filter(
                (action: Action) => action.type === 'stats/mergeStatsFilters'
            )
        expect(mergeStatsFiltersActions).toContainEqual(
            mergeStatsFilters({
                tags: [tagsFixtures[0].id],
            })
        )
    })

    describe('tags search', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should debounce tag search requests', async () => {
            const store = mockStore(defaultState)
            const {getByPlaceholderText} = render(
                <Provider store={store}>
                    <DEPRECATED_TagsStatsFilter value={[1]} />
                </Provider>
            )

            fireEvent.change(getByPlaceholderText('Search tags...'), {
                target: {value: 'foo'},
            })
            act(() => {
                jest.advanceTimersByTime(100)
            })
            fireEvent.change(getByPlaceholderText('Search tags...'), {
                target: {value: 'bar'},
            })
            act(() => {
                jest.runOnlyPendingTimers()
            })
            await waitFor(() =>
                expect(tagsFetchedSpy).toHaveBeenCalledWith(tagsFixtures)
            )

            expect(fetchTags).toHaveBeenCalledTimes(1)
            expect(fetchTags).toHaveBeenLastCalledWith(
                {
                    cursor: null,
                    orderBy: `${TagSortableProperties.Name}:${OrderDirection.Asc}`,
                    search: 'bar',
                },
                expect.anything()
            )
        })

        it('should fetch tags on scroll', async () => {
            const store = mockStore(defaultState)
            const {getByPlaceholderText, getByTestId} = render(
                <Provider store={store}>
                    <DEPRECATED_TagsStatsFilter value={[1]} />
                </Provider>
            )

            fireEvent.change(getByPlaceholderText('Search tags...'), {
                target: {value: 'foo'},
            })
            act(() => {
                jest.runOnlyPendingTimers()
            })
            fireEvent.click(getByTestId('infinite-container'))

            await waitFor(() =>
                expect(fetchTags).toHaveBeenLastCalledWith(
                    {
                        cursor: null,
                        orderBy: `${TagSortableProperties.Name}:${OrderDirection.Asc}`,
                        search: 'foo',
                    },
                    expect.anything()
                )
            )
        })
    })
})
