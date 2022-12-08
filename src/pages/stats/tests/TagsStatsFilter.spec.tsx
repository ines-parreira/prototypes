import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {act, fireEvent, render, waitFor} from '@testing-library/react'
import _keyBy from 'lodash/keyBy'
import {Action} from 'redux'

import {tags as tagsFixtures} from '../../../fixtures/tag'
import {RootState} from '../../../state/types'
import TagsStatsFilter from '../TagsStatsFilter'
import {fetchTags} from '../../../models/tag/resources'
import {TagSortableProperties} from '../../../models/tag/types'
import {OrderDirection} from '../../../models/api/types'
import * as tagsActions from '../../../state/entities/tags/actions'
import InfiniteScroll from '../../common/components/InfiniteScroll/InfiniteScroll'
import {MERGE_STATS_FILTERS} from '../../../state/stats/constants'

jest.mock('../../../models/tag/resources')
jest.mock(
    '../../common/components/InfiniteScroll/InfiniteScroll',
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

describe('TagsStatsFilter', () => {
    const defaultState = {
        stats: fromJS({
            filters: null,
        }),
        entities: {
            tags: _keyBy(tagsFixtures, (tag) => tag.id),
        } as unknown as RootState['entities'],
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        tagsFetchedSpy = jest.spyOn(tagsActions, 'tagsFetched')

        fetchTagsMock.mockResolvedValue({
            config: {},
            data: {
                uri: '/api/tags/',
                data: tagsFixtures,
                meta: {
                    next_cursor: null,
                    prev_cursor: null,
                },
                object: 'list',
            },
            headers: {},
            status: 200,
            statusText: '',
        })
    })

    afterEach(() => {
        tagsFetchedSpy.mockRestore()
    })

    it('should render the selected tags', async () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TagsStatsFilter
                    value={[tagsFixtures[0].id, tagsFixtures[2].id]}
                />
            </Provider>
        )

        await waitFor(() =>
            expect(tagsFetchedSpy).toHaveBeenCalledWith(tagsFixtures)
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should merge stats filters on item select', async () => {
        const store = mockStore(defaultState)
        const {getByLabelText} = render(
            <Provider store={store}>
                <TagsStatsFilter value={[]} />
            </Provider>
        )

        await waitFor(() =>
            expect(tagsFetchedSpy).toHaveBeenCalledWith(tagsFixtures)
        )
        fireEvent.click(getByLabelText(tagsFixtures[0].name))

        const mergeStatsFiltersActions = store
            .getActions()
            .filter((action: Action) => action.type === MERGE_STATS_FILTERS)
        expect(mergeStatsFiltersActions).toMatchSnapshot()
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
                    <TagsStatsFilter value={[1]} />
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
                    <TagsStatsFilter value={[1]} />
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
