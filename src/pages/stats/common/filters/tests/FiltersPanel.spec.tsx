import userEvent from '@testing-library/user-event'
import React from 'react'
import {screen} from '@testing-library/react'
import * as PeriodFilter from 'pages/stats/common/filters/PeriodFilter'
import {apiListCursorPaginationResponse} from 'fixtures/axiosResponse'
import {useGetCustomFieldDefinitions} from 'models/customField/queries'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {ADD_FILTER_BUTTON_LABEL} from 'pages/stats/common/filters/AddFilterButton'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {FilterKey, StaticFilter} from 'models/stat/types'
import {
    FiltersPanel,
    UNSUPPORTED_FILTER_PLACEHOLDER,
} from 'pages/stats/common/filters/FiltersPanel'
import {initialState, statsSlice} from 'state/stats/statsSlice'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {HelpCenter} from 'models/helpCenter/types'
import {assumeMock, renderWithStore} from 'utils/testing'
import {customFieldsMockReponse} from 'fixtures/customField'

const mockedLocales = [
    {name: 'English', code: 'en-US'},
    {name: 'Spanish', code: 'es-ES'},
    {name: 'French', code: 'fr-FR'},
    {name: 'German', code: 'de-DE'},
]

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: () => mockedLocales,
}))

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
} as RootState

describe('FiltersPanel without data', () => {
    beforeEach(() => {
        useGetCustomFieldDefinitionsMock.mockReturnValue(
            apiListCursorPaginationResponse([]) as any
        )
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
    ]

    beforeEach(() => {
        useGetCustomFieldDefinitionsMock.mockReturnValue(
            apiListCursorPaginationResponse(customFieldsMockReponse) as any
        )
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

    it('should allow adding optional Filters', () => {
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

    it('should render customFields filter', () => {
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
