import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import {Tag} from '@gorgias/api-queries'

import {useTagSearch} from 'hooks/reporting/common/useTagSearch'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {tags} from 'fixtures/tag'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {stateToProps, TagsFilter} from 'pages/stats/common/filters/TagsFilter'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {assumeMock, renderWithStore} from 'utils/testing'
import {statFiltersClean} from 'state/ui/stats/actions'
import {SegmentEvent, logEvent} from 'common/segment'
import {FilterKey, TagFilter, TagFilterInstanceId} from 'models/stat/types'

jest.mock('hooks/reporting/common/useTagSearch')
const useTagSearchMock = assumeMock(useTagSearch)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

describe('<TagsFilter />', () => {
    const someTags = tags
    const tagState = tags.reduce<Record<string, Tag>>((state, tag) => {
        state[tag.id] = tag
        return state
    }, {})
    beforeEach(() => {
        useTagSearchMock.mockReturnValue({
            tags: someTags,
            handleTagsSearch: jest.fn(),
            onLoad: jest.fn(),
            shouldLoadMore: false,
            tagIds: someTags.map((tag) => String(tag.id)),
            tagsState: tagState,
        })
    })

    it('Should render first batch of tags', () => {
        const selectedTags: number[] = []

        renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
            />,
            {}
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(tags[0].name)).toBeInTheDocument()
    })

    it('Should not render values selected in the second instance', () => {
        const selectedTags = [1, 2]
        const anotherInstance: TagFilter = {
            ...withDefaultLogicalOperator(selectedTags),
            filterInstanceId: TagFilterInstanceId.First,
        }
        const currentInstance: TagFilter = {
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [],
            filterInstanceId: TagFilterInstanceId.Second,
        }

        renderWithStore(
            <TagsFilter value={currentInstance} otherValue={anotherInstance} />,
            {}
        )
        userEvent.click(
            screen.getByText(LogicalOperatorLabel[currentInstance.operator])
        )

        tags.filter((tag) => !selectedTags.includes(tag.id)).forEach((tag) => {
            expect(screen.getByText(tag.name)).toBeInTheDocument()
        })
        tags.filter((tag) => selectedTags.includes(tag.id)).forEach((tag) => {
            expect(screen.queryByText(tag.name)).not.toBeInTheDocument()
        })
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting tag', () => {
        const selectedTags: number[] = []

        const {store} = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
            />,
            {}
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(someTags[0].name))

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: [
                    {
                        ...withDefaultLogicalOperator([someTags[0].id]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            })
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting tag, including the value of a second filter', () => {
        const selectedTags: number[] = []
        const otherValue: TagFilter = {
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [3],
            filterInstanceId: TagFilterInstanceId.Second,
        }

        const {store} = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                otherValue={otherValue}
            />,
            {}
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(someTags[0].name))

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: [
                    {
                        ...withDefaultLogicalOperator([someTags[0].id]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                    otherValue,
                ],
            })
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting all tags and deselecting all tags', () => {
        const selectedTags: number[] = []

        const {rerender, store} = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
            />,
            {}
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableTags = tags.map((tag) => tag.id)

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: [
                    {
                        values: allAvailableTags,
                        operator: LogicalOperatorEnum.ONE_OF,
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            })
        )

        rerender(
            <Provider store={store}>
                <TagsFilter
                    value={{
                        ...withDefaultLogicalOperator(allAvailableTags),
                        filterInstanceId: TagFilterInstanceId.First,
                    }}
                />
            </Provider>
        )

        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: [],
            })
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting one of the tags', () => {
        const selectedTags: number[] = []
        const selectedTag = tags[0]

        const {rerender, store} = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
            />,
            {}
        )

        const allAvailableTags = tags.map((tag) => tag.id)

        rerender(
            <Provider store={store}>
                <TagsFilter
                    value={{
                        ...withDefaultLogicalOperator(allAvailableTags),
                        filterInstanceId: TagFilterInstanceId.First,
                    }}
                />
            </Provider>
        )

        userEvent.click(
            screen.getByText(
                new RegExp(
                    LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF],
                    'i'
                )
            )
        )
        userEvent.click(screen.getByText(selectedTag.name))

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: [
                    {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: allAvailableTags.filter(
                            (tag) => tag !== selectedTag.id
                        ),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            })
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting all tags when filters dropdown is closed', () => {
        const selectedTags: number[] = []

        const {rerender, store} = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
            />,
            {}
        )
        const clearFilterIcon = 'close'

        const allAvailableTags = tags.map((tag) => tag.id)

        rerender(
            <Provider store={store}>
                <TagsFilter
                    value={{
                        ...withDefaultLogicalOperator(allAvailableTags),
                        filterInstanceId: TagFilterInstanceId.First,
                    }}
                />
            </Provider>
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: [],
            })
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action with otherFilterValue intact on deselecting all tags when filters dropdown is closed', () => {
        const selectedTags: number[] = []
        const otherValue: TagFilter = {
            operator: LogicalOperatorEnum.ALL_OF,
            values: [3],
            filterInstanceId: TagFilterInstanceId.Second,
        }

        const {rerender, store} = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                otherValue={otherValue}
            />,
            {}
        )
        const clearFilterIcon = 'close'

        const allAvailableTags = tags.map((tag) => tag.id)

        rerender(
            <Provider store={store}>
                <TagsFilter
                    value={{
                        ...withDefaultLogicalOperator(allAvailableTags),
                        filterInstanceId: TagFilterInstanceId.First,
                    }}
                    otherValue={otherValue}
                />
            </Provider>
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: [otherValue],
            })
        )
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        const selectedTags: number[] = []

        const {store} = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
            />,
            {}
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isOneOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF], 'i')
        )
        const isAllOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ALL_OF], 'i')
        )
        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i'
            )
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: [
                    {
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: [],
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            })
        )

        userEvent.click(isOneOfRadioLabel)

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: [
                    {
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: [],
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            })
        )

        userEvent.click(isAllOfRadioLabel)

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: [
                    {
                        operator: LogicalOperatorEnum.ALL_OF,
                        values: [],
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            })
        )
    })

    it('should change selection of logical operator including value from another filter', () => {
        const selectedTags: number[] = []
        const otherValue: TagFilter = {
            operator: LogicalOperatorEnum.ALL_OF,
            values: [3],
            filterInstanceId: TagFilterInstanceId.Second,
        }

        const {store} = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                otherValue={otherValue}
            />,
            {}
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i'
            )
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: [
                    {
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: [],
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                    otherValue,
                ],
            })
        )
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        const selectedTag = tags[0]
        const anotherSelectedTag = tags[1]
        const {rerenderComponent, store} = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator([selectedTag.id]),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
            />,
            {}
        )

        userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF])
        )
        userEvent.click(screen.getByText(anotherSelectedTag.name))
        userEvent.click(
            screen.getAllByText(
                LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]
            )[0]
        )

        rerenderComponent(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator([selectedTag.id]),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
            />,
            store as any
        )

        expect(store.getActions()).toContainEqual(statFiltersClean())
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.Tags,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })
})

describe('stateToProps', () => {
    it('when called without tag filters in state it should assign default value', () => {
        const state = {
            stats: initialState,
        } as RootState

        const props = stateToProps(state, {})

        expect(props).toEqual({
            value: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [],
                filterInstanceId: TagFilterInstanceId.First,
            },
            otherValue: undefined,
        })
    })

    it('when called without tag filters in state it should assign empty opposite operator', () => {
        const existingFilter = {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [1, 2],
            filterInstanceId: TagFilterInstanceId.Second,
        }
        const state = {
            stats: {
                filters: {
                    ...initialState.filters,
                    tags: [existingFilter],
                },
            },
        } as RootState

        const props = stateToProps(state, {
            filterInstanceId: TagFilterInstanceId.First,
        })

        expect(props).toEqual({
            value: {
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: [],
                filterInstanceId: TagFilterInstanceId.First,
            },
            otherValue: existingFilter,
        })
    })
})
