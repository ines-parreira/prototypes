import React from 'react'

import { screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import HelpCenterLanguageFilter, {
    HelpCenterLanguageFilterWithState,
} from 'domains/reporting/pages/common/filters/HelpCenterLanguageFilter'
import { emptyFilter } from 'domains/reporting/pages/common/filters/helpers'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import { HelpCenter } from 'models/helpCenter/types'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_PLACEHOLDER,
} from 'pages/common/forms/FilterInput/constants'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

const defaultState = {
    stats: {
        filters: {
            ...statsSlice.initialState.filters,
            helpCenters: withDefaultLogicalOperator([2]),
        },
    },
    entities: {
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
} as RootState

const mockedLocales = [
    { name: 'English', code: 'en-US' },
    { name: 'Spanish', code: 'es-ES' },
    { name: 'French', code: 'fr-FR' },
    { name: 'German', code: 'de-DE' },
]

const HELP_CENTER_LANG_FILTER_NAME = FilterLabels[FilterKey.LocaleCodes]

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: () => mockedLocales,
}))

const dispatchUpdate = jest.fn()

const renderComponent = () =>
    renderWithStore(
        <HelpCenterLanguageFilter
            value={emptyFilter}
            dispatchUpdate={dispatchUpdate}
        />,
        defaultState,
    )

describe('HelpCenterLanguageFilter', () => {
    const getLocaleByName = (name: string) =>
        mockedLocales.find((locale) => locale.name === name) || {
            name: 'Default',
            code: 'em-EM',
        }
    const isOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]}`,
        'i',
    )

    it('should render HelpCenterLanguageFilter component', () => {
        renderComponent()

        expect(
            screen.getByText(HELP_CENTER_LANG_FILTER_NAME),
        ).toBeInTheDocument()
    })

    it('should render with empty filter', () => {
        renderWithStore(
            <HelpCenterLanguageFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

        expect(
            screen.getByText(HELP_CENTER_LANG_FILTER_NAME),
        ).toBeInTheDocument()
    })

    it('should render with empty filter when no help centers available', () => {
        const state = {
            ...defaultState,
            entities: {
                helpCenter: {
                    helpCenters: {},
                },
            },
        } as RootState

        renderWithStore(
            <HelpCenterLanguageFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
            />,
            state,
        )

        expect(
            screen.getByText(HELP_CENTER_LANG_FILTER_NAME),
        ).toBeInTheDocument()
    })

    it('should render HelpCenterLanguageFilter options', () => {
        renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(
            screen.getByText(getLocaleByName('English').name),
        ).toBeInTheDocument()
        expect(
            screen.getByText(getLocaleByName('German').name),
        ).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFilters action on selecting an language', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(getLocaleByName('English').name))
        userEvent.click(screen.getByText(getLocaleByName('German').name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([getLocaleByName('English').code]),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([getLocaleByName('German').code]),
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting an language', () => {
        renderWithStore(
            <HelpCenterLanguageFilter
                value={withDefaultLogicalOperator([
                    getLocaleByName('English').code,
                    getLocaleByName('German').code,
                ])}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(
            screen.getByRole('option', {
                name: getLocaleByName('English').name,
            }),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([getLocaleByName('German').code]),
        )
    })

    it('should not dispatch mergeStatsFilters action on deselecting a single selected language', () => {
        renderWithStore(
            <HelpCenterLanguageFilter
                value={withDefaultLogicalOperator([
                    getLocaleByName('English').code,
                ])}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(
            screen.getByRole('option', {
                name: getLocaleByName('English').name,
            }),
        )

        expect(dispatchUpdate).not.toHaveBeenCalled()
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isOneOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF], 'i'),
        )
        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i',
            ),
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [],
        })

        userEvent.click(isOneOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [],
        })
    })

    it('should render the HelpCenterLanguageFilterWithState and reflect the value coming from store', () => {
        const stateWithHelpCenterLanguageValues = {
            ...defaultState,
            stats: {
                ...defaultState.stats,
                filters: {
                    ...statsSlice.initialState.filters,
                    helpCenters: withDefaultLogicalOperator([2]),
                    [FilterKey.LocaleCodes]: withDefaultLogicalOperator([
                        getLocaleByName('English').code,
                    ]),
                },
            },
        }
        renderWithStore(
            <HelpCenterLanguageFilterWithState />,
            stateWithHelpCenterLanguageValues,
        )

        expect(
            screen.getByText(HELP_CENTER_LANG_FILTER_NAME),
        ).toBeInTheDocument()

        expect(
            screen.getByText(getLocaleByName('English').name),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(getLocaleByName('German').name),
        ).not.toBeInTheDocument()
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        renderWithStore(
            <HelpCenterLanguageFilter
                value={withDefaultLogicalOperator([
                    getLocaleByName('English').code,
                ])}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.LocaleCodes,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('HelpCenterLanguageFilterWithState', () => {
        it('should render HelpCenterFilterWithState component', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            renderWithStore(<HelpCenterLanguageFilterWithState />, defaultState)
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(
                screen.getByRole('option', {
                    name: getLocaleByName('English').name,
                }),
            )

            expect(
                screen.getByText(FilterLabels[FilterKey.LocaleCodes]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()
        })
    })
})
