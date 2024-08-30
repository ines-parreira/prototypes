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
import {TagsFilter} from 'pages/stats/common/filters/TagsFilter'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('hooks/reporting/common/useTagSearch')
const useTagSearchMock = assumeMock(useTagSearch)

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
            <TagsFilter value={withDefaultLogicalOperator(selectedTags)} />,
            {}
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(tags[0].name)).toBeInTheDocument()
    })

    it('Should render first batch of tags with no selected values provided', () => {
        renderWithStore(<TagsFilter value={undefined} />, {})
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(tags[0].name)).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting tag', () => {
        const selectedTags: number[] = []

        const {store} = renderWithStore(
            <TagsFilter value={withDefaultLogicalOperator(selectedTags)} />,
            {}
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(someTags[0].name))

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: withDefaultLogicalOperator([someTags[0].id]),
            })
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting all tags and deselecting all tags', () => {
        const selectedTags: number[] = []

        const {rerender, store} = renderWithStore(
            <TagsFilter value={withDefaultLogicalOperator(selectedTags)} />,
            {}
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableTags = tags.map((tag) => tag.id)

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: {
                    values: allAvailableTags,
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            })
        )

        rerender(
            <Provider store={store}>
                <TagsFilter
                    value={withDefaultLogicalOperator(allAvailableTags)}
                />
            </Provider>
        )

        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: withDefaultLogicalOperator([]),
            })
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting one of the tags', () => {
        const selectedTags: number[] = []
        const selectedTag = tags[0]

        const {rerender, store} = renderWithStore(
            <TagsFilter value={withDefaultLogicalOperator(selectedTags)} />,
            {}
        )

        const allAvailableTags = tags.map((tag) => tag.id)

        rerender(
            <Provider store={store}>
                <TagsFilter
                    value={withDefaultLogicalOperator(allAvailableTags)}
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
                tags: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: allAvailableTags.filter(
                        (tag) => tag !== selectedTag.id
                    ),
                },
            })
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting all tags when filters dropdown is closed', () => {
        const selectedTags: number[] = []

        const {rerender, store} = renderWithStore(
            <TagsFilter value={withDefaultLogicalOperator(selectedTags)} />,
            {}
        )
        const clearFilterIcon = 'close'

        const allAvailableTags = tags.map((tag) => tag.id)

        rerender(
            <Provider store={store}>
                <TagsFilter
                    value={withDefaultLogicalOperator(allAvailableTags)}
                />
            </Provider>
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [],
                },
            })
        )
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        const selectedTags: number[] = []

        const {store} = renderWithStore(
            <TagsFilter value={withDefaultLogicalOperator(selectedTags)} />,
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
                tags: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )

        userEvent.click(isOneOfRadioLabel)

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )

        userEvent.click(isAllOfRadioLabel)

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                tags: {
                    operator: LogicalOperatorEnum.ALL_OF,
                    values: [],
                },
            })
        )
    })
})
