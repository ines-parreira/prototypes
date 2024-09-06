import {useListSlaPolicies} from '@gorgias/api-queries'
import {within} from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {act, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {FeatureFlagKey} from 'config/featureFlags'
import {FILTER_SELECT_ALL_LABEL} from 'pages/stats/common/components/Filter/constants'
import * as PeriodFilter from 'pages/stats/common/filters/PeriodFilter'
import {apiListCursorPaginationResponse} from 'fixtures/axiosResponse'
import {useGetCustomFieldDefinitions} from 'models/customField/queries'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {ADD_FILTER_BUTTON_LABEL} from 'pages/stats/common/filters/AddFilterButton'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState} from 'state/types'
import {
    busiestTimesSlice,
    initialState as busiestTimesInitialState,
} from 'state/ui/stats/busiestTimesSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {
    CleanFilterComponentKeys,
    FilterComponentKey,
    FilterKey,
    StateOnlyFilterKeys,
    StaticFilter,
} from 'models/stat/types'
import {
    initialState as ticketInsightsSliceStatsInitialState,
    ticketInsightsSlice,
} from 'state/ui/stats/ticketInsightsSlice'
import {
    FiltersPanel,
    isFilterTypeWithValues,
    UNSUPPORTED_FILTER_PLACEHOLDER,
} from 'pages/stats/common/filters/FiltersPanel'
import {initialState, statsSlice} from 'state/stats/statsSlice'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {HelpCenter} from 'models/helpCenter/types'
import {assumeMock, renderWithStore} from 'utils/testing'
import {customFieldsMockReponse} from 'fixtures/customField'
import {getIntegration} from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import {IntegrationType} from 'models/integration/constants'
import {billingState} from 'fixtures/billing'
import {
    filterKeyToStateKeyMapper,
    getFilteredFilterComponentKeys,
} from 'pages/stats/common/filters/helpers'

const mockedLocales = [
    {name: 'English', code: 'en-US'},
    {name: 'Spanish', code: 'es-ES'},
    {name: 'French', code: 'fr-FR'},
    {name: 'German', code: 'de-DE'},
]

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: () => mockedLocales,
}))
jest.mock('@gorgias/api-queries')
const useListSlaPoliciesMock = assumeMock(useListSlaPolicies)
jest.mock('models/customField/queries')
const useGetCustomFieldDefinitionsMock = assumeMock(
    useGetCustomFieldDefinitions
)

jest.mock(
    'pages/stats/common/filters/PeriodFilter',
    () =>
        ({
            ...jest.requireActual('pages/stats/common/filters/PeriodFilter'),
        } as Record<string, unknown>)
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
        stats: uiStatsInitialState,
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
    entities: {
        tags: {},
        helpCenter: {
            helpCenters: {
                helpCentersById: getHelpCentersResponseFixture.data.reduce(
                    (acc: Record<string, HelpCenter>, hCenter) => {
                        acc[hCenter.id] = hCenter
                        return acc
                    },
                    {}
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
            apiListCursorPaginationResponse([]) as any
        )
        useListSlaPoliciesMock.mockReturnValue({
            data: {data: {data: []}},
            isError: false,
            isLoading: false,
        } as any)
    })
    it('should render the panel without filters', () => {
        const {container} = renderWithStore(<FiltersPanel />, defaultState)

        expect(container.firstChild).toContainHTML(
            '<div class="wrapper"></div>'
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
        FilterKey.Channels,
        FilterKey.Integrations,
        FilterKey.Tags,
        FilterKey.Agents,
        FilterKey.HelpCenters,
        FilterKey.LocaleCodes,
        FilterKey.SlaPolicies,
        FilterComponentKey.BusiestTimesMetricSelectFilter,
        FilterComponentKey.CustomField,
        FilterComponentKey.Store,
        FilterComponentKey.PhoneIntegrations,
    ]

    beforeEach(() => {
        useGetCustomFieldDefinitionsMock.mockReturnValue(
            apiListCursorPaginationResponse(customFieldsMockReponse) as any
        )
        mockFlags({
            [FeatureFlagKey.AnalyticsCustomFieldsFilter]: true,
        })
    })

    it.each(supportedFilters)(
        'should render all supported filters',
        (filter) => {
            renderWithStore(
                <FiltersPanel
                    persistentFilters={[filter]}
                    optionalFilters={[]}
                />,
                defaultState
            )
            expect(
                screen.getByText(new RegExp(FilterLabels[filter]))
            ).toBeInTheDocument()
        }
    )

    it('should render a placeholder for unsupported filter', () => {
        const unsupportedFilter = FilterKey.Score
        renderWithStore(
            <FiltersPanel
                persistentFilters={[unsupportedFilter]}
                optionalFilters={[]}
            />,
            defaultState
        )

        expect(
            screen.getByText(new RegExp(UNSUPPORTED_FILTER_PLACEHOLDER))
        ).toBeInTheDocument()
    })

    it('should render only persistentFilters by default', () => {
        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            defaultState
        )

        persistentFilters.forEach((filter) => {
            expect(screen.getByText(FilterLabels[filter])).toBeInTheDocument()
        })

        optionalFilters.forEach((filter) => {
            expect(
                screen.queryByText(FilterLabels[filter])
            ).not.toBeInTheDocument()
        })
    })

    it('should allow adding optional Filters with Dropdown open by default', () => {
        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            defaultState
        )

        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            })
        )

        userEvent.click(
            screen.getByRole('option', {name: FilterLabels[optionalFilter]})
        )

        expect(
            screen.queryByText(new RegExp(FilterLabels[optionalFilter]))
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', {
                name: new RegExp(FILTER_SELECT_ALL_LABEL),
            })
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
            defaultState
        )
        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            })
        )
        const filtersOnDropDown = screen.getByRole('option', {
            name: FilterLabels[FilterKey.Channels],
        }).parentElement

        expect(filtersOnDropDown?.children).toHaveLength(5)
        expect(filtersOnDropDown?.children?.[0]?.textContent).toBe(
            FilterLabels[FilterKey.Agents]
        )
        expect(filtersOnDropDown?.children?.[1]?.textContent).toBe(
            FilterLabels[FilterKey.Channels]
        )
        expect(filtersOnDropDown?.children?.[2]?.textContent).toBe(
            FilterLabels[FilterKey.Tags]
        )
        expect(filtersOnDropDown?.children?.[3]?.textContent).toBe(
            customFieldsMockReponse.data[1].label
        )
        expect(filtersOnDropDown?.children?.[4]?.textContent).toBe(
            customFieldsMockReponse.data[0].label
        )
    })

    it('should add optional filters in order you click on them', () => {
        const expectElementsToBeInOrderYouSelectedThemFromTheList = (
            elements: HTMLElement[]
        ) => {
            for (let i = 1; i < elements.length; i++) {
                expect(
                    elements[i - 1].compareDocumentPosition(elements[i])
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
                (filter) => FilterLabels[filter]
            )
        const state = {
            ...defaultState,
            [statsSlice.name]: {
                ...defaultState[statsSlice.name],
                filters: {...initialState.filters},
            },
        }

        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={filtersInAlphabeticalOrder}
            />,
            state
        )

        filtersInRandomOrderToBeAddedToThePanelAsLabels.forEach((label) => {
            userEvent.click(
                screen.getByRole('button', {
                    name: new RegExp(ADD_FILTER_BUTTON_LABEL),
                })
            )
            userEvent.click(
                screen.getByRole('option', {
                    name: label,
                })
            )
        })

        filtersInRandomOrderToBeAddedToThePanelAsLabels.forEach((label) => {
            expect(screen.queryByText(new RegExp(label))).toBeInTheDocument()
        })

        const filtersThatWereAddedAsTextFromHTML =
            filtersInRandomOrderToBeAddedToThePanelAsLabels.map(
                (label) => screen.getByText(new RegExp(label)).innerHTML
            )

        expectElementsToBeInOrderYouSelectedThemFromTheList(
            filtersInRandomOrderToBeAddedToThePanelAsLabels.map((label) =>
                screen.getByText(new RegExp(label))
            )
        )

        expect(filtersInRandomOrderToBeAddedToThePanelAsLabels).toEqual(
            filtersThatWereAddedAsTextFromHTML
        )
    })

    it('should allow adding optional Filters after initial render', async () => {
        const initialFilters = [FilterKey.Tags, FilterKey.Agents]
        const newFilter = FilterKey.Channels
        const {rerender, store} = renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={initialFilters}
            />,
            defaultState
        )

        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            })
        )
        initialFilters.forEach((filterKey) => {
            expect(
                screen.getByText(FilterLabels[filterKey])
            ).toBeInTheDocument()
        })

        act(() => {
            rerender(
                <Provider store={store}>
                    <FiltersPanel
                        persistentFilters={persistentFilters}
                        optionalFilters={[...initialFilters, newFilter]}
                    />
                </Provider>
            )
        })

        initialFilters.forEach((filterKey) => {
            expect(
                screen.getByText(FilterLabels[filterKey])
            ).toBeInTheDocument()
        })
        await waitFor(() => {
            expect(
                screen.getByText(FilterLabels[newFilter])
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
        const {rerenderComponent} = renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={initialFilters}
            />,
            defaultState
        )

        initialFilters.forEach((filterKey) => {
            expect(
                screen.queryByText(FilterLabels[filterKey])
            ).not.toBeInTheDocument()
        })

        rerenderComponent(
            newState,
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={initialFilters}
            />
        )

        expect(
            screen.getByText(FilterLabels[FilterKey.Agents])
        ).toBeInTheDocument()
    })

    it('should allow removal of optional Filters', () => {
        renderWithStore(
            <FiltersPanel optionalFilters={optionalFilters} />,
            defaultState
        )

        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            })
        )
        userEvent.click(
            screen.getByRole('option', {name: FilterLabels[optionalFilter]})
        )

        expect(
            screen.queryByText(new RegExp(FilterLabels[optionalFilter]))
        ).toBeInTheDocument()

        userEvent.click(screen.getByText('close'))

        expect(
            screen.queryByText(new RegExp(FilterLabels[optionalFilter]))
        ).not.toBeInTheDocument()
    })

    it('should render selected optional Filters by default', () => {
        const state = {
            ...defaultState,
            [statsSlice.name]: {
                filters: fromLegacyStatsFilters({
                    period: initialState.filters.period,
                    [optionalFilter]: ['1', '2'],
                }),
            },
        } as RootState

        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
            />,
            state
        )

        expect(
            screen.getByText(new RegExp(FilterLabels[optionalFilter]))
        ).toBeInTheDocument()
    })

    it('should render customFields filter', async () => {
        const customFieldLabel = customFieldsMockReponse.data[0].label
        const customFieldsFilters = [FilterKey.CustomFields]
        const state = {
            ...defaultState,
            [statsSlice.name]: {
                filters: fromLegacyStatsFilters({
                    period: initialState.filters.period,
                    [optionalFilter]: ['1', '2'],
                    [FilterKey.CustomFields]: ['1:field'],
                }),
            },
        } as RootState

        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={customFieldsFilters}
            />,
            state
        )
        userEvent.click(
            screen.getByRole('button', {
                name: new RegExp(ADD_FILTER_BUTTON_LABEL),
            })
        )

        expect(screen.getByText(customFieldLabel)).toBeInTheDocument()

        act(() => {
            userEvent.click(
                screen.getByRole('option', {
                    name: new RegExp(customFieldLabel),
                })
            )
        })

        await waitFor(() => {
            expect(
                screen
                    .getAllByTestId('filter-name')
                    .find(
                        (filterContainer) =>
                            !!within(filterContainer).queryByText(
                                customFieldLabel
                            )
                    )
            ).toBeInTheDocument()
        })
    })

    it('should not render customFields filter when the flag is disabled', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsCustomFieldsFilter]: false,
        })
        const customFieldsFilters = [FilterKey.CustomFields]
        const state = {
            ...defaultState,
            [statsSlice.name]: {
                filters: fromLegacyStatsFilters({
                    period: initialState.filters.period,
                    [optionalFilter]: ['1', '2'],
                    [FilterKey.CustomFields]: ['1:field'],
                }),
            },
        } as RootState

        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={customFieldsFilters}
            />,
            state
        )

        expect(
            screen.queryByText(customFieldsMockReponse.data[0].label)
        ).not.toBeInTheDocument()
    })

    it('should allow passing some initialSettings to the PeriodFilter', () => {
        const spy = jest.fn().mockImplementation(() => null)
        ;(PeriodFilter as {PeriodFilterWithState: any}).PeriodFilterWithState =
            spy

        const periodFilterInitialSettings = {
            maxSpan: 123,
            tooltipMessageForPreviousPeriod: 'someString',
        }
        renderWithStore(
            <FiltersPanel
                persistentFilters={persistentFilters}
                optionalFilters={optionalFilters}
                filterSettingsOverrides={{
                    [FilterKey.Period]: {
                        initialSettings: periodFilterInitialSettings,
                    },
                }}
            />,
            defaultState
        )

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                initialSettings: periodFilterInitialSettings,
            }),
            {}
        )
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
            FilterKey.Tags,
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
            FilterComponentKey.Store,
            FilterComponentKey.BusiestTimesMetricSelectFilter,
        ]

        invalidFilterTypes.forEach((type) => {
            expect(isFilterTypeWithValues(type)).toBe(false)
        })
    })
})

describe('filterKeyToStateKeyMapper', () => {
    it.each<[CleanFilterComponentKeys, FilterKey]>([
        [FilterComponentKey.Store, FilterKey.Integrations],
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
            FilterComponentKey.Store,
        ]

        const result = getFilteredFilterComponentKeys(keys)

        expect(result).toEqual([FilterComponentKey.Store])
    })

    it('should include all other keys besides BusiestTimesMetricSelectFilter', () => {
        const keys = [
            FilterComponentKey.BusiestTimesMetricSelectFilter,
            FilterComponentKey.Store,
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
            FilterKey.Tags,
        ]

        const result = getFilteredFilterComponentKeys(keys)

        expect(result).toEqual([
            FilterComponentKey.Store,
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
            FilterKey.Tags,
        ])
    })
})
