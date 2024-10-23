import React from 'react'
import userEvent from '@testing-library/user-event'
import {screen} from '@testing-library/react'

import {fromJS} from 'immutable'
import isEqual from 'lodash/isEqual'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {Team} from 'models/team/types'
import {statFiltersClean} from 'state/ui/stats/actions'

import {renderWithStore} from 'utils/testing'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import AgentsFilter, {
    AgentsFiltersWithState,
} from 'pages/stats/common/filters/AgentsFilter'
import {extendedAgents} from 'pages/stats/common/filters/tests/fixtures/agents'
import {extendedTeams} from 'pages/stats/common/filters/tests/fixtures/teams'
import {FilterKey} from 'models/stat/types'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {SegmentEvent, logEvent} from 'common/segment'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const defaultState = {
    stats: initialState,
    agents: fromJS({
        all: extendedAgents,
    }),
    teams: fromJS({
        all: extendedTeams,
    }),
} as RootState

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

describe('AgentsFilter', () => {
    const isOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]}`,
        'i'
    )

    const checkIfMockedDispatchWasCalledWithExpectedArguments = (
        mockCalls: Record<string, any>[],
        expectedObject: Record<string, any>
    ) => {
        return mockCalls.some((mockCall) =>
            isEqual(mockCall[0], expectedObject)
        )
    }

    it('should render AgentsFilter component', () => {
        renderWithStore(
            <AgentsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        expect(
            screen.getByText(FilterLabels[FilterKey.Agents])
        ).toBeInTheDocument()
    })

    it('should render AgentsFilter options', () => {
        renderWithStore(
            <AgentsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(extendedAgents[0].name)).toBeInTheDocument()
        expect(screen.getByText(extendedAgents[1].name)).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting an agent', () => {
        renderWithStore(
            <AgentsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        userEvent.click(screen.getByText(extendedAgents[0].name))
        userEvent.click(screen.getByText(extendedAgents[1].name))

        const isFirstAgentInDispatch =
            checkIfMockedDispatchWasCalledWithExpectedArguments(
                mockedDispatch.mock.calls,
                mergeStatsFiltersWithLogicalOperator({
                    agents: withDefaultLogicalOperator([extendedAgents[0].id]),
                })
            )
        const isSecondAgentInDispatch =
            checkIfMockedDispatchWasCalledWithExpectedArguments(
                mockedDispatch.mock.calls,
                mergeStatsFiltersWithLogicalOperator({
                    agents: withDefaultLogicalOperator([extendedAgents[1].id]),
                })
            )

        expect(isFirstAgentInDispatch).toBe(true)
        expect(isSecondAgentInDispatch).toBe(true)
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting a team', () => {
        renderWithStore(
            <AgentsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        userEvent.click(screen.getByText(extendedTeams[0].name))
        userEvent.click(screen.getByText(extendedTeams[1].name))

        const isFirstTeamMembersInDispatch =
            checkIfMockedDispatchWasCalledWithExpectedArguments(
                mockedDispatch.mock.calls,
                mergeStatsFiltersWithLogicalOperator({
                    agents: withDefaultLogicalOperator(
                        extendedTeams[0].members.map((member) => member.id)
                    ),
                })
            )
        const isSecondTeamMembersInDispatch =
            checkIfMockedDispatchWasCalledWithExpectedArguments(
                mockedDispatch.mock.calls,
                mergeStatsFiltersWithLogicalOperator({
                    agents: withDefaultLogicalOperator(
                        extendedTeams[1].members.map((member) => member.id)
                    ),
                })
            )

        expect(isFirstTeamMembersInDispatch).toBe(true)
        expect(isSecondTeamMembersInDispatch).toBe(true)
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting a team', () => {
        const {rerenderComponent} = renderWithStore(
            <AgentsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
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
            />,
            defaultState
        )
        mockedDispatch.mockClear()
        userEvent.click(screen.getByText(testTeam.name))

        const selectedTeamMembersNotInDispatch =
            checkIfMockedDispatchWasCalledWithExpectedArguments(
                mockedDispatch.mock.calls,
                mergeStatsFiltersWithLogicalOperator({
                    agents: withDefaultLogicalOperator(
                        testTeam.members.map((member) => member.id)
                    ),
                })
            )
        const selectedAgentInDispatch =
            checkIfMockedDispatchWasCalledWithExpectedArguments(
                mockedDispatch.mock.calls,
                mergeStatsFiltersWithLogicalOperator({
                    agents: withDefaultLogicalOperator([testAgent.id]),
                })
            )

        expect(selectedTeamMembersNotInDispatch).toBe(false)
        expect(selectedAgentInDispatch).toBe(true)
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting all agents and deselecting all agents', () => {
        const {rerenderComponent} = renderWithStore(
            <AgentsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableAgentsIds = withDefaultLogicalOperator(
            extendedAgents.map((agents) => agents.id)
        )

        const areAllAgentsInDispatch =
            checkIfMockedDispatchWasCalledWithExpectedArguments(
                mockedDispatch.mock.calls,
                mergeStatsFiltersWithLogicalOperator({
                    agents: withDefaultLogicalOperator(
                        extendedAgents.map((agents) => agents.id)
                    ),
                })
            )
        let areEmptyAgentsInDispatch =
            checkIfMockedDispatchWasCalledWithExpectedArguments(
                mockedDispatch.mock.calls,
                mergeStatsFiltersWithLogicalOperator({
                    agents: withDefaultLogicalOperator([]),
                })
            )
        expect(areAllAgentsInDispatch).toBe(true)
        expect(areEmptyAgentsInDispatch).toBe(false)

        rerenderComponent(
            <AgentsFilter value={allAvailableAgentsIds} />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        areEmptyAgentsInDispatch =
            checkIfMockedDispatchWasCalledWithExpectedArguments(
                mockedDispatch.mock.calls,
                mergeStatsFiltersWithLogicalOperator({
                    agents: withDefaultLogicalOperator([]),
                })
            )

        expect(areEmptyAgentsInDispatch).toBe(true)
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting one of the agent', () => {
        const {rerenderComponent} = renderWithStore(
            <AgentsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )

        const allAvailableAgentsIds = withDefaultLogicalOperator(
            extendedAgents.map((agents) => agents.id)
        )

        rerenderComponent(
            <AgentsFilter value={allAvailableAgentsIds} />,
            defaultState
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(extendedAgents[0].name))

        const allAgentsWithoutTheFirstOne =
            checkIfMockedDispatchWasCalledWithExpectedArguments(
                mockedDispatch.mock.calls,
                mergeStatsFiltersWithLogicalOperator({
                    agents: withDefaultLogicalOperator(
                        extendedAgents
                            .map((agents) => agents.id)
                            .filter((id) => id !== extendedAgents[0].id)
                    ),
                })
            )

        expect(allAgentsWithoutTheFirstOne).toBe(true)
    })

    it('should dispatch mergeStatsFilters action on deselecting all agents when filters dropdown is closed', () => {
        const {rerenderComponent} = renderWithStore(
            <AgentsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        const clearFilterIcon = 'close'

        const allAvailableAgentsIds = withDefaultLogicalOperator(
            extendedAgents.map((agents) => agents.id)
        )

        rerenderComponent(
            <AgentsFilter value={allAvailableAgentsIds} />,
            defaultState
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        const emptyAgents = checkIfMockedDispatchWasCalledWithExpectedArguments(
            mockedDispatch.mock.calls,
            mergeStatsFiltersWithLogicalOperator({
                agents: withDefaultLogicalOperator([]),
            })
        )

        expect(emptyAgents).toBe(true)
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        renderWithStore(
            <AgentsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isOneOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF], 'i')
        )
        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i'
            )
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                agents: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )

        userEvent.click(isOneOfRadioLabel)

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                agents: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )
    })

    it('should render AgentsFilter component even if value is undefined', () => {
        renderWithStore(<AgentsFilter value={undefined} />, defaultState)
        expect(
            screen.getByText(FilterLabels[FilterKey.Agents])
        ).toBeInTheDocument()
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        const {rerenderComponent} = renderWithStore(
            <AgentsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(extendedAgents[0].name))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(
            <AgentsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )

        expect(mockedDispatch).toHaveBeenCalledWith(statFiltersClean())
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
            renderWithStore(<AgentsFiltersWithState />, defaultState)
            expect(
                screen.getByText(FilterLabels[FilterKey.Agents])
            ).toBeInTheDocument()
        })
    })
})
