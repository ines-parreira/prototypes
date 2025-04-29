import React from 'react'

import { within } from '@testing-library/dom'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { Tag, useListSlaPolicies } from '@gorgias/api-queries'

import { useGetCustomFieldDefinitions } from 'custom-fields/hooks/queries/queries'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import { billingState } from 'fixtures/billing'
import { customFieldsMockResponse } from 'fixtures/customField'
import { tags } from 'fixtures/tag'
import { useTagSearch } from 'hooks/reporting/common/useTagSearch'
import { useVoiceQueueSearch } from 'hooks/reporting/common/useVoiceQueueSearch'
import { HelpCenter } from 'models/helpCenter/types'
import { IntegrationType } from 'models/integration/constants'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import {
    CleanFilterComponentKeys,
    FilterComponentKey,
    FilterKey,
    StateOnlyFilterKeys,
    StaticFilter,
    TagFilterInstanceId,
} from 'models/stat/types'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
} from 'pages/stats/common/components/Filter/constants'
import { ADD_FILTER_BUTTON_LABEL } from 'pages/stats/common/filters/AddFilterButton'
import {
    AUTO_QA_FILTER_KEYS,
    FilterLabels,
} from 'pages/stats/common/filters/constants'
import {
    FiltersPanel,
    FiltersPanelComponent,
    isFilterTypeWithValues,
} from 'pages/stats/common/filters/FiltersPanel'
import {
    FilterComponentMap,
    SavedFilterComponentMap,
} from 'pages/stats/common/filters/FiltersPanelConfig'
import {
    filterKeyToStateKeyMapper,
    getFilteredFilterComponentKeys,
} from 'pages/stats/common/filters/helpers'
import { getHasAutomate } from 'state/billing/selectors'
import { initialState, statsSlice } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import {
    initialState as busiestTimesInitialState,
    busiestTimesSlice,
} from 'state/ui/stats/busiestTimesSlice'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import {
    ticketInsightsSlice,
    initialState as ticketInsightsSliceStatsInitialState,
} from 'state/ui/stats/ticketInsightsSlice'
import { assumeMock, renderWithStore } from 'utils/testing'

const mockedLocales = [
    { name: 'English', code: 'en-US' },
    { name: 'Spanish', code: 'es-ES' },
    { name: 'French', code: 'fr-FR' },
    { name: 'German', code: 'de-DE' },
]

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: () => mockedLocales,
}))
jest.mock('@gorgias/api-queries')
const useListSlaPoliciesMock = assumeMock(useListSlaPolicies)
jest.mock('custom-fields/hooks/queries/queries')
const useGetCustomFieldDefinitionsMock = assumeMock(
    useGetCustomFieldDefinitions,
)
jest.mock('hooks/reporting/common/useTagSearch')
const useTagSearchMock = assumeMock(useTagSearch)

jest.mock('state/billing/selectors', () => ({ getHasAutomate: jest.fn() }))
const getHasAutomateMock = assumeMock(getHasAutomate)

jest.mock('hooks/reporting/common/useVoiceQueueSearch')
const useVoiceQueueSearchMock = assumeMock(useVoiceQueueSearch)

jest.mock(
    'pages/stats/common/filters/PeriodFilter',
    () =>
        ({
            ...jest.requireActual('pages/stats/common/filters/PeriodFilter'),
        }) as Record<string, unknown>,
)

const defaultState = {
    [statsSlice.name]: {
        ...initialState,
        filters: {
            ...initialState.filters,
            helpCenters: withDefaultLogicalOperator([
                getHelpCentersResponseFixture.data[1].id,
            ]),
        },
    },
    ui: {
        stats: {
            filters: uiStatsInitialState,
            [busiestTimesSlice.name]: busiestTimesInitialState,
            [ticketInsightsSlice.name]: {
                ...ticketInsightsSliceStatsInitialState,
                selectedCustomField: {
                    id: 1,
                    label: '',
                    isLoading: false,
                },
            },
        },
    },
    entities: {
        tags: {},
        helpCenter: {
            helpCenters: {
                helpCentersById: getHelpCentersResponseFixture.data.reduce(
                    (acc: Record<string, HelpCenter>, hCenter) => {
                        acc[hCenter.id] = hCenter
                        return acc
                    },
                    {},
                ),
            },
        },
    },
    integrations: fromJS({
        integrations: [
            getIntegration(1, IntegrationType.Shopify),
            getIntegration(2, IntegrationType.Magento2),
            getIntegration(3, IntegrationType.Shopify),
        ],
    }),
    billing: fromJS(billingState),
} as RootState

describe('FiltersPanel without data', () => {
    beforeEach(() => {
        useGetCustomFieldDefinitionsMock.mockReturnValue(
            apiListCursorPaginationResponse([]) as any,
        )
        useListSlaPoliciesMock.mockReturnValue({
            data: { data: { data: [] } },
            isError: false,
            isLoading: false,
        } as any)
    })
    it('should render the panel without filters', () => {
        const { container } = renderWithStore(<FiltersPanel />, defaultState)

        expect(container.firstChild).toContainHTML(
            '<div class="wrapper"></div>',
        )
    })
})

describe('FiltersPanel', () => {
    const persistentFilters: StaticFilter[] = [FilterKey.Period]
    const optionalFilter = FilterKey.Channels
    const optionalFilters = [
        optionalFilter,
        FilterKey.LocaleCodes,
        FilterKey.CustomFields,
    ]
    const supportedFilters: StaticFilter[] = [
        FilterKey.Period,
        FilterKey.AggregationWindow,
        FilterKey.Channels,
        FilterKey.Integrations,
        FilterKey.Agents,
        FilterKey.HelpCenters,
        FilterKey.LocaleCodes,
        FilterKey.SlaPolicies,
        FilterComponentKey.BusiestTimesMetricSelectFilter,
        FilterComponentKey.CustomField,
        FilterKey.StoreIntegrations,
        FilterComponentKey.PhoneIntegrations,
        FilterKey.Campaigns,
        FilterKey.CampaignStatuses,
        FilterKey.Score,
        FilterKey.VoiceQueues,
    ]
    const unSupportedSaveFilters: StaticFilter[] = [
        FilterKey.AggregationWindow,
        FilterKey.HelpCenters,
        FilterKey.LocaleCodes,
        FilterKey.Period,
        FilterKey.SlaPolicies,
        FilterComponentKey.BusiestTimesMetricSelectFilter,
        FilterComponentKey.CustomField,
        FilterComponentKey.PhoneIntegrations,
        FilterKey.StoreIntegrations,
    ]

    const someTags = tags
    const tagState = tags.reduce<Record<string, Tag>>((state, tag) => {
        state[tag.id] = tag
        return state
    }, {})

    beforeEach(() => {
        useGetCustomFieldDefinitionsMock.mockReturnValue(
            apiListCursorPaginationResponse(customFieldsMockResponse) as any,
        )
        useTagSearchMock.mockReturnValue({
            tags: someTags,
            handleTagsSearch: jest.fn(),
            onLoad: jest.fn(),
            shouldLoadMore: false,
            tagIds: someTags.map((tag) => String(tag.id)),
            tagsState: tagState,
        })
        getHasAutomateMock.mockReturnValue(true)
        useVoiceQueueSearchMock.mockReturnValue({
            handleVoiceQueueSearch: jest.fn() as any,
            onLoad: jest.fn(),
            voiceQueues: [],
            shouldLoadMore: false,
        } as unknown as ReturnType<typeof useVoiceQueueSearch>)
    })

    it.each(supportedFilters)(
        'should render all supported filters (%s)',
        (filter) => {
            renderWithStore(
                <FiltersPanel
                    persistentFilters={[filter]}
                    optionalFilters={[]}
                />,
                defaultState,
            )

            expect(screen.getByTestId('filter-name')).toHaveTextContent(
                new RegExp(FilterLabels[filter]),
            )
        },
    )

    it.each(unSupportedSaveFilters)(
        'should not render unsupported filters (%s)',
        (filter) => {
            renderWithStore(
                <FiltersPanelComponent
                    persistentFilters={[filter]}
                    optionalFilters={[]}
                    filterComponentMap={SavedFilterComponentMap}
                    cleanStatsFilters={initialState.filters}
                />,
                defaultState,
            )

            expect(screen.queryByTestId('filter-name')).not.toBeInTheDocument()
        },
    )

    it('should render only persistentFilters without a divider if there arent any optional filters', () => {
        const { baseElement } = renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={[]}
            />,
            defaultState,
        )

        persistentFilters.forEach((filter) => {
            expect(screen.getByText(FilterLabels[filter])).toBeInTheDocument()
        })

        expect(baseElement.getElementsByClassName('divider').length).toBe(0)
    })

    it('should render persistentFilters and a divider if there are optional filters', () => {
        const { baseElement } = renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            defaultState,
        )

        persistentFilters.forEach((filter) => {
            expect(screen.getByText(FilterLabels[filter])).toBeInTheDocument()
        })

        expect(baseElement.getElementsByClassName('divider').length).toBe(0)

        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            }),
        )

        userEvent.click(
            screen.getByRole('option', { name: FilterLabels[optionalFilter] }),
        )

        expect(baseElement.getElementsByClassName('divider').length).toBe(1)
    })

    it('should allow adding optional Filters with Dropdown open by default', () => {
        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            defaultState,
        )

        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            }),
        )

        userEvent.click(
            screen.getByRole('option', { name: FilterLabels[optionalFilter] }),
        )

        expect(
            screen.queryByText(new RegExp(FilterLabels[optionalFilter])),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', {
                name: new RegExp(FILTER_SELECT_ALL_LABEL),
            }),
        ).toBeInTheDocument()
    })

    it('dropdown options should be alphabetically ordered', () => {
        const unsortedFilters = [
            FilterKey.Channels,
            FilterKey.Tags,
            FilterKey.CustomFields,
            FilterKey.Agents,
        ]
        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={unsortedFilters}
            />,
            defaultState,
        )
        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            }),
        )
        const filtersOnDropDown = screen.queryAllByRole('option')

        expect(filtersOnDropDown).toHaveLength(5)
        expect(filtersOnDropDown[0]?.textContent).toBe(
            FilterLabels[FilterKey.Agents],
        )
        expect(filtersOnDropDown[1]?.textContent).toBe(
            FilterLabels[FilterKey.Channels],
        )
        expect(filtersOnDropDown[2]?.textContent).toBe(
            FilterLabels[FilterKey.Tags],
        )
        expect(filtersOnDropDown[3]?.textContent).toBe(
            customFieldsMockResponse.data[1].label,
        )
        expect(filtersOnDropDown[4]?.textContent).toBe(
            customFieldsMockResponse.data[0].label,
        )
    })

    it('should add optional filters in order you click on them', () => {
        const expectElementsToBeInOrderYouSelectedThemFromTheList = (
            elements: HTMLElement[],
        ) => {
            for (let i = 1; i < elements.length; i++) {
                expect(
                    elements[i - 1].compareDocumentPosition(elements[i]),
                ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
            }
        }
        const filtersInAlphabeticalOrder = [
            FilterKey.Agents,
            FilterKey.Channels,
            FilterKey.HelpCenters,
            FilterKey.Integrations,
            FilterKey.Tags,
        ]
        const filtersInRandomOrderToBeAddedToThePanel = [
            FilterKey.Tags,
            FilterKey.Agents,
            FilterKey.Integrations,
            FilterKey.HelpCenters,
            FilterKey.Channels,
        ]
        const filtersInRandomOrderToBeAddedToThePanelAsLabels =
            filtersInRandomOrderToBeAddedToThePanel.map(
                (filter) => FilterLabels[filter],
            )
        const state = {
            ...defaultState,
            [statsSlice.name]: {
                ...defaultState[statsSlice.name],
                filters: { ...initialState.filters },
            },
        }

        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={filtersInAlphabeticalOrder}
            />,
            state,
        )

        filtersInRandomOrderToBeAddedToThePanelAsLabels.forEach((label) => {
            userEvent.click(
                screen.getByRole('button', {
                    name: new RegExp(ADD_FILTER_BUTTON_LABEL),
                }),
            )
            userEvent.click(
                screen.getByRole('option', {
                    name: label,
                }),
            )
        })

        filtersInRandomOrderToBeAddedToThePanelAsLabels.forEach((label) => {
            expect(screen.queryByText(new RegExp(label))).toBeInTheDocument()
        })

        const filtersThatWereAddedAsTextFromHTML =
            filtersInRandomOrderToBeAddedToThePanelAsLabels.map(
                (label) => screen.getByText(new RegExp(label)).innerHTML,
            )

        expectElementsToBeInOrderYouSelectedThemFromTheList(
            filtersInRandomOrderToBeAddedToThePanelAsLabels.map((label) =>
                screen.getByText(new RegExp(label)),
            ),
        )

        expect(filtersInRandomOrderToBeAddedToThePanelAsLabels).toEqual(
            filtersThatWereAddedAsTextFromHTML,
        )
    })

    it('should allow adding optional Filters after initial render', async () => {
        const initialFilters = [FilterKey.Tags, FilterKey.Agents]
        const newFilter = FilterKey.Channels
        const { rerender, store } = renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={initialFilters}
            />,
            defaultState,
        )

        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            }),
        )
        initialFilters.forEach((filterKey) => {
            expect(
                screen.getByText(FilterLabels[filterKey]),
            ).toBeInTheDocument()
        })

        act(() => {
            rerender(
                <Provider store={store}>
                    <FiltersPanel
                        persistentFilters={persistentFilters}
                        optionalFilters={[...initialFilters, newFilter]}
                    />
                </Provider>,
            )
        })

        initialFilters.forEach((filterKey) => {
            expect(
                screen.getByText(FilterLabels[filterKey]),
            ).toBeInTheDocument()
        })
        await waitFor(() => {
            expect(
                screen.getByText(FilterLabels[newFilter]),
            ).toBeInTheDocument()
        })
    })

    it('should allow adding filters that have state set, but filter is not in the panel', () => {
        const initialFilters = [
            FilterKey.Tags,
            FilterKey.Integrations,
            FilterKey.Agents,
        ]
        const newState = {
            ...defaultState,
            [statsSlice.name]: {
                ...defaultState[statsSlice.name],
                filters: {
                    ...defaultState[statsSlice.name].filters,
                    [FilterKey.Agents]: withDefaultLogicalOperator([1, 2, 3]),
                },
            },
        }
        const { rerenderComponent } = renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={initialFilters}
            />,
            defaultState,
        )

        initialFilters.forEach((filterKey) => {
            expect(
                screen.queryByText(FilterLabels[filterKey]),
            ).not.toBeInTheDocument()
        })

        rerenderComponent(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={initialFilters}
            />,
            newState,
        )

        expect(
            screen.getByText(FilterLabels[FilterKey.Agents]),
        ).toBeInTheDocument()
    })

    it('should allow removal of optional Filters', () => {
        renderWithStore(
            <FiltersPanel optionalFilters={optionalFilters} />,
            defaultState,
        )

        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            }),
        )
        userEvent.click(
            screen.getByRole('option', { name: FilterLabels[optionalFilter] }),
        )

        expect(
            screen.queryByText(new RegExp(FilterLabels[optionalFilter])),
        ).toBeInTheDocument()

        userEvent.click(screen.getByText('close'))

        expect(
            screen.queryByText(new RegExp(FilterLabels[optionalFilter])),
        ).not.toBeInTheDocument()
    })

    it('should render selected optional Filters by default', () => {
        const state = {
            ...defaultState,
            [statsSlice.name]: {
                filters: {
                    period: initialState.filters.period,
                    [optionalFilter]: withDefaultLogicalOperator(['1', '2']),
                },
            },
        } as RootState

        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            state,
        )

        expect(
            screen.getByText(new RegExp(FilterLabels[optionalFilter])),
        ).toBeInTheDocument()
    })

    it('should not hide a filter if the value was removed but filter was initialised by the User', () => {
        const state = {
            ...defaultState,
            [statsSlice.name]: {
                filters: {
                    period: initialState.filters.period,
                },
            },
        } as RootState

        const { rerenderComponent } = renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            state,
        )

        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            }),
        )
        userEvent.click(
            screen.getByRole('option', { name: FilterLabels[optionalFilter] }),
        )

        expect(
            screen.getByText(new RegExp(FilterLabels[optionalFilter])),
        ).toBeInTheDocument()

        rerenderComponent(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            {
                ...defaultState,
                [statsSlice.name]: {
                    filters: {
                        period: initialState.filters.period,
                        [optionalFilter]: withDefaultLogicalOperator([
                            '1',
                            '2',
                        ]),
                    },
                },
            },
        )

        expect(
            screen.getByText(new RegExp(FilterLabels[optionalFilter])),
        ).toBeInTheDocument()

        rerenderComponent(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            {
                ...defaultState,
                [statsSlice.name]: {
                    filters: {
                        period: initialState.filters.period,
                    },
                },
            },
        )

        expect(
            screen.getByText(new RegExp(FilterLabels[optionalFilter])),
        ).toBeInTheDocument()
    })

    it('should hide a filter if the value was removed but filter was not initialised by the User', () => {
        const state = {
            ...defaultState,
            [statsSlice.name]: {
                filters: {
                    period: initialState.filters.period,
                    [optionalFilter]: withDefaultLogicalOperator(['1', '2']),
                },
            },
        } as RootState

        const { rerenderComponent } = renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            state,
        )

        expect(
            screen.getByText(new RegExp(FilterLabels[optionalFilter])),
        ).toBeInTheDocument()

        rerenderComponent(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            {
                ...defaultState,
                [statsSlice.name]: {
                    filters: {
                        period: initialState.filters.period,
                    },
                },
            },
        )

        expect(
            screen.queryByText(new RegExp(FilterLabels[optionalFilter])),
        ).not.toBeInTheDocument()
    })

    it('should render customFields filter', async () => {
        const customFieldLabel = customFieldsMockResponse.data[0].label
        const customFieldsFilters = [FilterKey.CustomFields]
        const state = {
            ...defaultState,
            [statsSlice.name]: {
                filters: {
                    period: initialState.filters.period,
                    [optionalFilter]: withDefaultLogicalOperator(['1', '2']),
                    [FilterKey.CustomFields]: [
                        {
                            ...withDefaultLogicalOperator(['1:field']),
                            customFieldId: 1,
                        },
                    ],
                },
            },
        } as RootState

        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={customFieldsFilters}
            />,
            state,
        )
        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            }),
        )

        expect(screen.getByText(customFieldLabel)).toBeInTheDocument()

        act(() => {
            userEvent.click(
                screen.getByRole('option', {
                    name: new RegExp(customFieldLabel),
                }),
            )
        })

        await waitFor(() => {
            expect(
                screen
                    .getAllByTestId('filter-name')
                    .find(
                        (filterContainer) =>
                            !!within(filterContainer).queryByText(
                                customFieldLabel,
                            ),
                    ),
            ).toBeInTheDocument()
        })
    })

    it('should hide and show optional filters', async () => {
        const state = {
            ...defaultState,
            [statsSlice.name]: {
                filters: {
                    period: initialState.filters.period,
                    [optionalFilter]: withDefaultLogicalOperator(['1', '2']),
                },
            },
        } as RootState

        const { rerenderComponent } = renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            state,
        )
        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            }),
        )
        userEvent.click(screen.getByText(FilterLabels[FilterKey.Channels]))

        expect(
            screen.getByText(FilterLabels[FilterKey.Channels]),
        ).toBeInTheDocument()

        rerenderComponent(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
                shouldHideFilters
            />,
            state,
        )

        await waitFor(() => {
            expect(
                screen.queryByText(FilterLabels[FilterKey.Channels]),
            ).not.toBeInTheDocument()
        })

        rerenderComponent(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            state,
        )

        await waitFor(() => {
            expect(
                screen.getByText(FilterLabels[FilterKey.Channels]),
            ).toBeInTheDocument()
        })
    })

    describe('TagsFilter', () => {
        it('should render two instances of the Tags filter', () => {
            const optionalFilters = [FilterKey.Tags]
            const state = {
                ...defaultState,
                [statsSlice.name]: {
                    filters: {
                        period: initialState.filters.period,
                        [FilterKey.Tags]: [
                            {
                                operator: LogicalOperatorEnum.ONE_OF,
                                values: [1, 2],
                                filterInstanceId: TagFilterInstanceId.First,
                            },
                            {
                                operator: LogicalOperatorEnum.NOT_ONE_OF,
                                values: [3, 4],
                                filterInstanceId: TagFilterInstanceId.Second,
                            },
                        ],
                    },
                },
            } as RootState

            act(() => {
                renderWithStore(
                    <FiltersPanel
                        persistentFilters={persistentFilters}
                        optionalFilters={optionalFilters}
                    />,
                    state,
                )
            })

            expect(
                screen.getAllByText(new RegExp(FilterLabels[FilterKey.Tags]))
                    .length,
            ).toEqual(2)
        })
    })

    it('should allow passing some initialSettings to the PeriodFilter', () => {
        const spy = jest.fn().mockImplementation(() => null)

        const periodFilterInitialSettings = {
            maxSpan: 123,
            tooltipMessageForPreviousPeriod: 'someString',
        }
        renderWithStore(
            <FiltersPanelComponent
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
                filterSettingsOverrides={{
                    [FilterKey.Period]: {
                        initialSettings: periodFilterInitialSettings,
                    },
                }}
                filterComponentMap={{
                    ...FilterComponentMap,
                    [FilterKey.Period]: spy,
                }}
                cleanStatsFilters={{
                    [FilterKey.Period]: {
                        start_datetime: '',
                        end_datetime: '',
                    },
                }}
            />,
            defaultState,
        )

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                initialSettings: periodFilterInitialSettings,
            }),
            {},
        )
    })

    describe('hasAutomate behavior', () => {
        const autoQAFilters = [...AUTO_QA_FILTER_KEYS]
        const nonAutoQAFilters = [
            FilterKey.Agents,
            FilterKey.Channels,
            FilterKey.Tags,
            FilterKey.Score,
        ]

        it('should show auto-qa filters when hasAutomate is true', () => {
            renderWithStore(
                <FiltersPanel
                    persistentFilters={[]}
                    optionalFilters={[...autoQAFilters, ...nonAutoQAFilters]}
                />,
                defaultState,
            )

            userEvent.click(
                screen.getByRole('button', {
                    name: new RegExp(ADD_FILTER_BUTTON_LABEL),
                }),
            )
            ;[...autoQAFilters, ...nonAutoQAFilters].forEach((filter) => {
                expect(
                    screen.getByRole('option', { name: FilterLabels[filter] }),
                ).toBeInTheDocument()
            })
        })

        it('should hide auto-qa filters when hasAutomate is false', () => {
            getHasAutomateMock.mockReturnValue(false)
            renderWithStore(
                <FiltersPanel
                    persistentFilters={[]}
                    optionalFilters={[...autoQAFilters, ...nonAutoQAFilters]}
                />,
                defaultState,
            )

            userEvent.click(
                screen.getByRole('button', {
                    name: new RegExp(ADD_FILTER_BUTTON_LABEL),
                }),
            )

            autoQAFilters.forEach((filter) => {
                expect(
                    screen.queryByRole('option', {
                        name: FilterLabels[filter],
                    }),
                ).not.toBeInTheDocument()
            })

            nonAutoQAFilters.forEach((filter) => {
                expect(
                    screen.getByRole('option', { name: FilterLabels[filter] }),
                ).toBeInTheDocument()
            })
        })

        it('should not affect persistent filters even when hasAutomate is false', () => {
            const state = {
                ...defaultState,
                billing: fromJS({
                    ...billingState,
                    hasAutomate: false,
                }),
            }

            renderWithStore(
                <FiltersPanel
                    persistentFilters={autoQAFilters}
                    optionalFilters={nonAutoQAFilters}
                />,
                state,
            )

            autoQAFilters.forEach((filter) => {
                expect(
                    screen.getByText(new RegExp(FilterLabels[filter])),
                ).toBeInTheDocument()
            })
        })
    })
})

describe('isFilterTypeWithValues', () => {
    it('returns true for valid filter types', () => {
        const validFilterTypes = [
            FilterKey.Agents,
            FilterKey.CampaignStatuses,
            FilterKey.Channels,
            FilterKey.HelpCenters,
            FilterKey.Integrations,
            FilterKey.LocaleCodes,
            FilterKey.Score,
            FilterKey.SlaPolicies,
        ]

        validFilterTypes.forEach((type) => {
            expect(isFilterTypeWithValues(type)).toBe(true)
        })
    })

    it('returns false for invalid filter types', () => {
        const invalidFilterTypes = [
            FilterKey.CustomFields,
            FilterKey.Period,
            FilterComponentKey.CustomField,
            FilterKey.StoreIntegrations,
            FilterComponentKey.BusiestTimesMetricSelectFilter,
        ]

        invalidFilterTypes.forEach((type) => {
            expect(isFilterTypeWithValues(type)).toBe(false)
        })
    })
})

describe('filterKeyToStateKeyMapper', () => {
    it.each<[CleanFilterComponentKeys, FilterKey]>([
        [FilterComponentKey.PhoneIntegrations, FilterKey.Integrations],
        [FilterComponentKey.CustomField, FilterKey.CustomFields],
    ])('should map %s to %s', (input, expected) => {
        expect(filterKeyToStateKeyMapper(input)).toBe(expected)
    })

    it.each<StateOnlyFilterKeys[]>([
        [FilterKey.Agents],
        [FilterKey.Campaigns],
        [FilterKey.CampaignStatuses],
        [FilterKey.Channels],
        [FilterKey.HelpCenters],
        [FilterKey.LocaleCodes],
        [FilterKey.Score],
        [FilterKey.SlaPolicies],
        [FilterKey.Tags],
    ])('should return the same key for FilterKey.%s', (filterKey) => {
        expect(filterKeyToStateKeyMapper(filterKey)).toBe(filterKey)
    })
})

describe('getFilteredFilterComponentKeys', () => {
    it('should filter out BusiestTimesMetricSelectFilter', () => {
        const keys = [
            FilterComponentKey.BusiestTimesMetricSelectFilter,
            FilterKey.StoreIntegrations,
        ]

        const result = getFilteredFilterComponentKeys(keys)

        expect(result).toEqual([FilterKey.StoreIntegrations])
    })

    it('should include all other keys besides BusiestTimesMetricSelectFilter', () => {
        const keys = [
            FilterComponentKey.BusiestTimesMetricSelectFilter,
            FilterComponentKey.PhoneIntegrations,
            FilterComponentKey.CustomField,
            FilterKey.Agents,
            FilterKey.Campaigns,
            FilterKey.CampaignStatuses,
            FilterKey.Channels,
            FilterKey.HelpCenters,
            FilterKey.Integrations,
            FilterKey.LocaleCodes,
            FilterKey.Score,
            FilterKey.SlaPolicies,
            FilterKey.StoreIntegrations,
            FilterKey.Tags,
        ]

        const result = getFilteredFilterComponentKeys(keys)

        expect(result).toEqual([
            FilterComponentKey.PhoneIntegrations,
            FilterComponentKey.CustomField,
            FilterKey.Agents,
            FilterKey.Campaigns,
            FilterKey.CampaignStatuses,
            FilterKey.Channels,
            FilterKey.HelpCenters,
            FilterKey.Integrations,
            FilterKey.LocaleCodes,
            FilterKey.Score,
            FilterKey.SlaPolicies,
            FilterKey.StoreIntegrations,
            FilterKey.Tags,
        ])
    })
})
