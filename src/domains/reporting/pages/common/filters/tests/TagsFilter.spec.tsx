import React from 'react'

import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { Tag } from '@gorgias/helpdesk-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { useTagSearch } from 'domains/reporting/hooks/common/useTagSearch'
import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import {
    FilterKey,
    TagFilter,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    getFilterInstanceProps,
    TagsFilter,
    TagsFilterWithSavedState,
    TagsFilterWithState,
} from 'domains/reporting/pages/common/filters/TagsFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { tags } from 'fixtures/tag'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

jest.mock('domains/reporting/hooks/common/useTagSearch')
const useTagSearchMock = assumeMock(useTagSearch)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

describe('<TagsFilter />', () => {
    const someTags = tags
    const tagState = tags.reduce<Record<string, Tag>>((state, tag) => {
        state[tag.id] = tag
        return state
    }, {})
    const defaultState = {
        stats: statsSlice.initialState,
        ui: {
            stats: {
                filters: filtersSlice.initialState,
            },
        },
    } as RootState
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
    const dispatchUpdate = jest.fn()
    const dispatchRemove = jest.fn()
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()

    it('Should render first batch of tags', () => {
        const selectedTags: number[] = []

        renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
                warningType="not-applicable"
            />,
            {},
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
            <TagsFilter
                value={currentInstance}
                otherValue={anotherInstance}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
                warningType="non-existent"
            />,
            {},
        )
        userEvent.click(
            screen.getByText(LogicalOperatorLabel[currentInstance.operator]),
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

        renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            {},
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(someTags[0].name))

        expect(dispatchUpdate).toHaveBeenCalledWith([
            {
                ...withDefaultLogicalOperator([someTags[0].id]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ])
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting tag, including the value of a second filter', () => {
        const selectedTags: number[] = []
        const otherValue: TagFilter = {
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [3],
            filterInstanceId: TagFilterInstanceId.Second,
        }

        renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                otherValue={otherValue}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            {},
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(someTags[0].name))

        expect(dispatchUpdate).toHaveBeenCalledWith([
            {
                ...withDefaultLogicalOperator([someTags[0].id]),
                filterInstanceId: TagFilterInstanceId.First,
            },
            otherValue,
        ])
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting all tags and deselecting all tags', () => {
        const selectedTags: number[] = []

        const { rerender, store } = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            {},
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableTags = tags.map((tag) => tag.id)

        expect(dispatchUpdate).toHaveBeenCalledWith([
            {
                values: allAvailableTags,
                operator: LogicalOperatorEnum.ONE_OF,
                filterInstanceId: TagFilterInstanceId.First,
            },
        ])

        rerender(
            <Provider store={store}>
                <TagsFilter
                    value={{
                        ...withDefaultLogicalOperator(allAvailableTags),
                        filterInstanceId: TagFilterInstanceId.First,
                    }}
                    dispatchUpdate={dispatchUpdate}
                    dispatchRemove={dispatchRemove}
                    dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                    dispatchStatFiltersClean={dispatchStatFiltersClean}
                />
            </Provider>,
        )

        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith([])
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting one of the tags', () => {
        const selectedTags: number[] = []
        const selectedTag = tags[0]

        const { rerender, store } = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            {},
        )

        const allAvailableTags = tags.map((tag) => tag.id)

        rerender(
            <Provider store={store}>
                <TagsFilter
                    value={{
                        ...withDefaultLogicalOperator(allAvailableTags),
                        filterInstanceId: TagFilterInstanceId.First,
                    }}
                    dispatchUpdate={dispatchUpdate}
                    dispatchRemove={dispatchRemove}
                    dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                    dispatchStatFiltersClean={dispatchStatFiltersClean}
                />
            </Provider>,
        )

        userEvent.click(
            screen.getByText(
                new RegExp(
                    LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF],
                    'i',
                ),
            ),
        )
        userEvent.click(screen.getByText(selectedTag.name))

        expect(dispatchUpdate).toHaveBeenCalledWith([
            {
                operator: LogicalOperatorEnum.ONE_OF,
                values: allAvailableTags.filter(
                    (tag) => tag !== selectedTag.id,
                ),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ])
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting all tags when filters dropdown is closed', () => {
        const selectedTags: number[] = []

        const { rerender, store } = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            {},
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
                    dispatchUpdate={dispatchUpdate}
                    dispatchRemove={dispatchRemove}
                    dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                    dispatchStatFiltersClean={dispatchStatFiltersClean}
                />
            </Provider>,
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(dispatchRemove).toHaveBeenCalledWith({
            filter: [],
            filterInstanceId: 'first',
        })
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action with otherFilterValue intact on deselecting all tags when filters dropdown is closed', () => {
        const selectedTags: number[] = []
        const otherValue: TagFilter = {
            operator: LogicalOperatorEnum.ALL_OF,
            values: [3],
            filterInstanceId: TagFilterInstanceId.Second,
        }

        const { rerender, store } = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                otherValue={otherValue}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            {},
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
                    dispatchUpdate={dispatchUpdate}
                    dispatchRemove={dispatchRemove}
                    dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                    dispatchStatFiltersClean={dispatchStatFiltersClean}
                />
            </Provider>,
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(dispatchRemove).toHaveBeenCalledWith({
            filter: [otherValue],
            filterInstanceId: 'first',
        })
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        const selectedTags: number[] = []

        renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            {},
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isOneOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF], 'i'),
        )
        const isAllOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ALL_OF], 'i'),
        )
        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i',
            ),
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith([
            {
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: [],
                filterInstanceId: TagFilterInstanceId.First,
            },
        ])

        userEvent.click(isOneOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith([
            {
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: [],
                filterInstanceId: TagFilterInstanceId.First,
            },
        ])

        userEvent.click(isAllOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith([
            {
                operator: LogicalOperatorEnum.ALL_OF,
                values: [],
                filterInstanceId: TagFilterInstanceId.First,
            },
        ])
    })

    it('should change selection of logical operator including value from another filter', () => {
        const selectedTags: number[] = []
        const otherValue: TagFilter = {
            operator: LogicalOperatorEnum.ALL_OF,
            values: [3],
            filterInstanceId: TagFilterInstanceId.Second,
        }

        renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator(selectedTags),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                otherValue={otherValue}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            {},
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i',
            ),
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith([
            {
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: [],
                filterInstanceId: TagFilterInstanceId.First,
            },
            otherValue,
        ])
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        const selectedTag = tags[0]
        const anotherSelectedTag = tags[1]
        const { rerenderComponent, store } = renderWithStore(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator([selectedTag.id]),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            {},
        )

        userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]),
        )
        userEvent.click(screen.getByText(anotherSelectedTag.name))
        userEvent.click(
            screen.getAllByText(
                LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF],
            )[0],
        )

        rerenderComponent(
            <TagsFilter
                value={{
                    ...withDefaultLogicalOperator([selectedTag.id]),
                    filterInstanceId: TagFilterInstanceId.First,
                }}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            store as any,
        )

        expect(dispatchStatFiltersClean).toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.Tags,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('TagsFilterWithState', () => {
        it('should pass dispatch action', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            renderWithStore(<TagsFilterWithState />, defaultState)
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Tags]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            userEvent.click(screen.getByText(new RegExp('close', 'i')))
            expect(spy).toHaveBeenCalledWith({
                [FilterKey.Tags]: [
                    {
                        ...withLogicalOperator([2, 1, 4, 3]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            })
        })
    })

    describe('TagsFilterWithSavedState', () => {
        it('should pass dispatch action', () => {
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')
            const removeSpy = jest.spyOn(
                filtersSlice,
                'removeFilterFromSavedFilterDraft',
            )

            renderWithStore(<TagsFilterWithSavedState />, defaultState)
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Tags]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            userEvent.click(screen.getByText(new RegExp('close', 'i')))
            expect(removeSpy).toHaveBeenCalledWith({
                filterKey: FilterKey.Tags,
                filterInstanceId: TagFilterInstanceId.First,
            })
        })
    })
})

describe('stateToProps', () => {
    it('when called without tag filters in state it should assign default value', () => {
        const props = getFilterInstanceProps([], {})

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
        const tagsFilter = [existingFilter]

        const props = getFilterInstanceProps(tagsFilter, {
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
