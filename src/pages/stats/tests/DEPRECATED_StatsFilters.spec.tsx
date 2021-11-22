import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {act, fireEvent, render, waitFor} from '@testing-library/react'

import {views} from '../../../config/stats'
import {agents as agentsFixtures} from '../../../fixtures/agents'
import {integrationsState} from '../../../fixtures/integrations'
import {tags as tagsFixtures} from '../../../fixtures/tag'
import {TagsState} from '../../../state/entities/tags/types'
import {StatsFiltersContainer} from '../DEPRECATED_StatsFilters'
import {fetchTags} from '../../../models/tag/resources'
import {TagSortableProperties} from '../../../models/tag/types'
import {OrderDirection} from '../../../models/api/types'
import InfiniteScroll from '../../common/components/InfiniteScroll/InfiniteScroll'

jest.mock('../common/PeriodPicker', () => () => 'PeriodPicker')
jest.mock('../../../models/tag/resources')
jest.mock('../../common/components/InfiniteScroll/InfiniteScroll')
;(
    InfiniteScroll as jest.MockedFunction<typeof InfiniteScroll>
).mockImplementation(
    ({onLoad, ...others}: ComponentProps<typeof InfiniteScroll>) => {
        return (
            <div
                {...others}
                onClick={onLoad}
                data-testid="infinite-container"
            />
        )
    }
)

const fetchTagsMock = fetchTags as jest.MockedFunction<typeof fetchTags>

describe('<StatsFilters />', () => {
    const minProps = {
        agents: agentsFixtures.map(({id, name}) => ({id, label: name})),
        channels: [],
        config: views.get('support-performance-overview'),
        currentAccount: fromJS({}),
        filters: fromJS({
            period: {
                start_datetime: '2021-05-29T00:00:00+02:00',
                end_datetime: '2021-06-04T23:59:59+02:00',
            },
        }),
        integrations: integrationsState.integrations,
        tags: tagsFixtures.reduce((tags: TagsState, tag) => {
            tags[tag.id.toString()] = tag
            return tags
        }, {}),
        teams: [],
        mergeStatsFilters: jest.fn(),
        tagsFetched: jest.fn(),
        notify: jest.fn(),
    } as unknown as ComponentProps<typeof StatsFiltersContainer>

    beforeEach(() => {
        jest.clearAllMocks()
        fetchTagsMock.mockResolvedValue({
            uri: '/api/tags/',
            data: tagsFixtures,
            meta: {
                current_page: 'url',
                item_count: 4,
                nb_pages: 1,
                page: 1,
                per_page: 30,
            },
            object: 'list',
        })
    })

    it('should display the page', () => {
        const {container} = render(<StatsFiltersContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should retrieve tags on first render', async () => {
        render(<StatsFiltersContainer {...minProps} />)

        await waitFor(() =>
            expect(minProps.tagsFetched).toHaveBeenCalledWith(tagsFixtures)
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
            const {getByPlaceholderText} = render(
                <StatsFiltersContainer {...minProps} />
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
                jest.runAllTimers()
            })
            await waitFor(() =>
                expect(minProps.tagsFetched).toHaveBeenCalledWith(tagsFixtures)
            )

            expect(fetchTags).toHaveBeenCalledTimes(1)
            expect(fetchTags).toHaveBeenLastCalledWith(
                {
                    orderBy: TagSortableProperties.Name,
                    orderDir: OrderDirection.Asc,
                    page: 1,
                    search: 'bar',
                },
                expect.anything()
            )
        })

        it('should fetch tags on scroll', async () => {
            const {getByPlaceholderText, getByTestId} = render(
                <StatsFiltersContainer {...minProps} />
            )

            fireEvent.change(getByPlaceholderText('Search tags...'), {
                target: {value: 'foo'},
            })
            act(() => {
                jest.runAllTimers()
            })
            fireEvent.click(getByTestId('infinite-container'))

            await waitFor(() =>
                expect(fetchTags).toHaveBeenLastCalledWith(
                    {
                        orderBy: TagSortableProperties.Name,
                        orderDir: OrderDirection.Asc,
                        page: 1,
                        search: 'foo',
                    },
                    expect.any(Object)
                )
            )
        })
    })
})
