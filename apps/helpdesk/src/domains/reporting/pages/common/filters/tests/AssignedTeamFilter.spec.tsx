import { logEvent, SegmentEvent } from '@repo/logging'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import AssignedTeamFilter, {
    AssignedTeamFilterWithSavedState,
    AssignedTeamFilterWithState,
} from 'domains/reporting/pages/common/filters/AssignedTeamFilter'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { teams } from 'fixtures/teams'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const clearFilterIcon = 'close'
const defaultState = {
    stats: statsSlice.initialState,
    ui: {
        stats: {
            filters: filtersSlice.initialState,
        },
    },
    teams: fromJS({
        all: teams.reduce((acc, team) => ({ ...acc, [team.id]: team }), {}),
    }),
} as RootState

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

const allAvailableTeamIds = withDefaultLogicalOperator(
    teams.map((team) => team.id),
)

const setupUserEvent = () => userEvent.setup()

const openDropdown = async (user: ReturnType<typeof userEvent.setup>) =>
    await act(() => user.click(screen.getByText(FILTER_VALUE_PLACEHOLDER)))
const clickTeam = async (
    user: ReturnType<typeof userEvent.setup>,
    teamName: string,
) => await act(() => user.click(screen.getByText(teamName)))

describe('AssignedTeamFilter', () => {
    const dispatchUpdate = jest.fn()
    const dispatchRemove = jest.fn()
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()

    const isOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]}`,
        'i',
    )

    const renderFilter = (
        value = withDefaultLogicalOperator([]),
        overrides = {},
    ) =>
        renderWithStore(
            <AssignedTeamFilter
                value={value}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
                {...overrides}
            />,
            defaultState,
        )

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render AssignedTeamFilter component', () => {
        renderFilter()
        expect(
            screen.getByText(FilterLabels[FilterKey.AssignedTeam]),
        ).toBeInTheDocument()
    })

    it('should render AssignedTeamFilter options', async () => {
        const user = setupUserEvent()
        renderFilter()
        await openDropdown(user)

        expect(screen.getByText(teams[0].name)).toBeInTheDocument()
        expect(screen.getByText(teams[1].name)).toBeInTheDocument()
    })

    it('should dispatch update action on selecting a team', async () => {
        const user = setupUserEvent()
        renderFilter()
        await openDropdown(user)
        await clickTeam(user, teams[0].name)

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([teams[0].id]),
        )
    })

    it('should dispatch update action on selecting multiple teams', async () => {
        const user = setupUserEvent()
        renderFilter()
        await openDropdown(user)
        await clickTeam(user, teams[0].name)
        await clickTeam(user, teams[1].name)

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([teams[0].id]),
        )
        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([teams[1].id]),
        )
    })

    it('should dispatch update action on selecting all teams and deselecting all teams', async () => {
        const user = setupUserEvent()
        const { rerenderComponent } = renderFilter()
        await openDropdown(user)
        await act(() => user.click(screen.getByText(FILTER_SELECT_ALL_LABEL)))

        expect(dispatchUpdate).toHaveBeenCalledWith(allAvailableTeamIds)
        expect(dispatchUpdate).not.toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )

        rerenderComponent(
            <AssignedTeamFilter
                value={allAvailableTeamIds}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        await act(() => user.click(screen.getByText(FILTER_DESELECT_ALL_LABEL)))
        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )
    })

    it('should dispatch update action on deselecting one of the team', async () => {
        const user = setupUserEvent()
        const { rerenderComponent } = renderFilter()

        rerenderComponent(
            <AssignedTeamFilter
                value={allAvailableTeamIds}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        await act(() => user.click(screen.getByText(isOneOfRegex)))
        await clickTeam(user, teams[0].name)

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(
                teams.map((team) => team.id).filter((id) => id !== teams[0].id),
            ),
        )
    })

    it('should dispatch remove action when filters dropdown is closed', async () => {
        const user = setupUserEvent()
        const { rerenderComponent } = renderFilter()

        rerenderComponent(
            <AssignedTeamFilter
                value={allAvailableTeamIds}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        await act(() =>
            user.click(screen.getByText(new RegExp(clearFilterIcon, 'i'))),
        )
        expect(dispatchRemove).toHaveBeenCalledWith()
    })

    it('should change selection of logical operator when one of the options is clicked', async () => {
        const user = setupUserEvent()
        renderFilter()
        await openDropdown(user)

        const isOneOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF], 'i'),
        )
        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i',
            ),
        )

        await act(() => user.click(isNotOneOfRadioLabel))
        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [],
        })

        await act(() => user.click(isOneOfRadioLabel))
        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [],
        })
    })

    it('should render AssignedTeamFilter component even if value is undefined', () => {
        renderFilter(undefined)
        expect(
            screen.getByText(FilterLabels[FilterKey.AssignedTeam]),
        ).toBeInTheDocument()
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', async () => {
        const user = setupUserEvent()
        const { rerenderComponent } = renderFilter()

        await openDropdown(user)
        await clickTeam(user, teams[0].name)
        await openDropdown(user)

        rerenderComponent(
            <AssignedTeamFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        expect(dispatchStatFiltersClean).toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.AssignedTeam,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('AssignedTeamFilterWithState', () => {
        it('should render AssignedTeamFilter component', async () => {
            const user = setupUserEvent()
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            renderWithStore(<AssignedTeamFilterWithState />, defaultState)
            await openDropdown(user)
            await act(() =>
                user.click(screen.getByText(FILTER_SELECT_ALL_LABEL)),
            )

            expect(
                screen.getByText(FilterLabels[FilterKey.AssignedTeam]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            await act(() =>
                user.click(screen.getByText(new RegExp(clearFilterIcon, 'i'))),
            )
            expect(spy).toHaveBeenCalledWith({ teams: withLogicalOperator([]) })
        })
    })

    describe('AssignedTeamFilterWithSavedState', () => {
        it('should render AssignedTeamFilter component', async () => {
            const user = setupUserEvent()
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')
            const removeSpy = jest.spyOn(
                filtersSlice,
                'removeFilterFromSavedFilterDraft',
            )

            renderWithStore(<AssignedTeamFilterWithSavedState />, defaultState)
            await openDropdown(user)
            await act(() =>
                user.click(screen.getByText(FILTER_SELECT_ALL_LABEL)),
            )

            expect(
                screen.getByText(FilterLabels[FilterKey.AssignedTeam]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            await act(() =>
                user.click(screen.getByText(new RegExp(clearFilterIcon, 'i'))),
            )
            expect(removeSpy).toHaveBeenCalledWith({
                filterKey: FilterKey.AssignedTeam,
            })
        })
    })
})
