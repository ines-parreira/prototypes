import React from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
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
import AgentsFilter, {
    AgentsFiltersWithSavedState,
    AgentsFiltersWithState,
} from 'domains/reporting/pages/common/filters/AgentsFilter'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import { extendedAgents } from 'domains/reporting/pages/common/filters/tests/fixtures/agents'
import { extendedTeams } from 'domains/reporting/pages/common/filters/tests/fixtures/teams'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { Team } from 'models/team/types'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const clearFilterIcon = 'close'
const defaultState = {
    stats: statsSlice.initialState,
    agents: fromJS({
        all: extendedAgents,
    }),
    teams: fromJS({
        all: extendedTeams,
    }),
    ui: {
        stats: {
            filters: filtersSlice.initialState,
        },
    },
} as RootState

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

describe('AgentsFilter', () => {
    const dispatchUpdate = jest.fn()
    const dispatchRemove = jest.fn()
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()

    const isOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]}`,
        'i',
    )

    it('should render AgentsFilter component', () => {
        renderWithStore(
            <AgentsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )
        expect(
            screen.getByText(FilterLabels[FilterKey.Agents]),
        ).toBeInTheDocument()
    })

    it('should render AgentsFilter options', () => {
        renderWithStore(
            <AgentsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(extendedAgents[0].name)).toBeInTheDocument()
        expect(screen.getByText(extendedAgents[1].name)).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting an agent', () => {
        renderWithStore(
            <AgentsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(extendedAgents[0].name))
        userEvent.click(screen.getByText(extendedAgents[1].name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([extendedAgents[0].id]),
        )
        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([extendedAgents[1].id]),
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting a team', () => {
        renderWithStore(
            <AgentsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        userEvent.click(screen.getByText(extendedTeams[0].name))
        userEvent.click(screen.getByText(extendedTeams[1].name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(
                extendedTeams[0].members.map((member) => member.id),
            ),
        )
        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(
                extendedTeams[1].members.map((member) => member.id),
            ),
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting a team', () => {
        const { rerenderComponent } = renderWithStore(
            <AgentsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )
        const testTeam = extendedTeams.find((t) => t.id === 36) as Team
        const testAgent = extendedAgents[0]

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(testTeam.name))

        rerenderComponent(
            <AgentsFilter
                value={withDefaultLogicalOperator([
                    ...testTeam.members.map((member) => member.id),
                    testAgent.id,
                ])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )
        mockedDispatch.mockClear()
        userEvent.click(screen.getByText(testTeam.name))

        expect(dispatchUpdate).not.toHaveBeenCalledWith(
            withDefaultLogicalOperator([
                ...testTeam.members.map((member) => member.id),
                testAgent.id,
            ]),
        )
        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([testAgent.id]),
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting all agents and deselecting all agents', () => {
        const { rerenderComponent } = renderWithStore(
            <AgentsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableAgentsIds = withDefaultLogicalOperator(
            extendedAgents.map((agents) => agents.id),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(
                extendedAgents.map((agents) => agents.id),
            ),
        )
        expect(dispatchUpdate).not.toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )

        rerenderComponent(
            <AgentsFilter
                value={allAvailableAgentsIds}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting one of the agent', () => {
        const { rerenderComponent } = renderWithStore(
            <AgentsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        const allAvailableAgentsIds = withDefaultLogicalOperator(
            extendedAgents.map((agents) => agents.id),
        )

        rerenderComponent(
            <AgentsFilter
                value={allAvailableAgentsIds}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(extendedAgents[0].name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(
                extendedAgents
                    .map((agents) => agents.id)
                    .filter((id) => id !== extendedAgents[0].id),
            ),
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting all agents when filters dropdown is closed', () => {
        const { rerenderComponent } = renderWithStore(
            <AgentsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        const allAvailableAgentsIds = withDefaultLogicalOperator(
            extendedAgents.map((agents) => agents.id),
        )

        rerenderComponent(
            <AgentsFilter
                value={allAvailableAgentsIds}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(dispatchRemove).toHaveBeenCalledWith()
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        renderWithStore(
            <AgentsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )
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

    it('should render AgentsFilter component even if value is undefined', () => {
        renderWithStore(
            <AgentsFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )
        expect(
            screen.getByText(FilterLabels[FilterKey.Agents]),
        ).toBeInTheDocument()
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        const { rerenderComponent } = renderWithStore(
            <AgentsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(extendedAgents[0].name))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(
            <AgentsFilter
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
            name: FilterKey.Agents,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('AgentsFiltersWithState', () => {
        it('should render AgentsFilter component', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            renderWithStore(<AgentsFiltersWithState />, defaultState)
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Agents]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))
            expect(spy).toHaveBeenCalledWith({
                [FilterKey.Agents]: withLogicalOperator([]),
            })
        })
    })

    describe('AgentsFiltersWithSavedState', () => {
        it('should render AgentsFilter component', () => {
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')
            const removeSpy = jest.spyOn(
                filtersSlice,
                'removeFilterFromSavedFilterDraft',
            )
            renderWithStore(<AgentsFiltersWithSavedState />, defaultState)

            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Agents]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))
            expect(removeSpy).toHaveBeenCalledWith({
                filterKey: FilterKey.Agents,
            })
        })
    })
})
