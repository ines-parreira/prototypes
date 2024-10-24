import {render, screen} from '@testing-library/react'
import React from 'react'

import {useAIAgentUserId} from 'hooks/reporting/automate/useAIAgentUserId'
import useAppDispatch from 'hooks/useAppDispatch'
import {StatsFiltersWithLogicalOperator} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {getHasAutomate} from 'state/billing/selectors'
import {getStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {setStatsFiltersWithLogicalOperators} from 'state/stats/statsSlice'

import AiAgentStatsFilters from '../AiAgentStatsFilters'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock(
    'hooks/useAppSelector',
    () =>
        (fn: () => any): any =>
            fn()
)

jest.mock('state/stats/selectors')
const getStatsFiltersWithLogicalOperatorsMock =
    getStatsFiltersWithLogicalOperators as unknown as jest.Mock

jest.mock('state/billing/selectors')
const getHasAutomateMock = getHasAutomate as unknown as jest.Mock

jest.mock('hooks/reporting/automate/useAIAgentUserId')
const useAIAgentUserIdMock = useAIAgentUserId as jest.Mock

jest.mock('state/stats/statsSlice', () => ({
    setStatsFiltersWithLogicalOperators: jest.fn(),
}))

jest.mock('pages/automate/common/components/AutomatePaywallView', () => () => (
    <div>automate-paywall-view</div>
))
jest.mock('pages/stats/automate/ai-agent/AiAgentStatsEmptyState', () => ({
    AiAgentStatsEmptyState: () => <div>ai-agent-stats-empty-state</div>,
}))

describe('AiAgentStatsFilters', () => {
    const dispatch = jest.fn()

    const renderComponent = ({
        children = <div>child-component</div>,
        aiAgentUserId = '5',
        hasAutomate = true,
        statsFilters = {
            period: {
                start_datetime: '2024-09-14T00:00:00+00:00',
                end_datetime: '2024-09-20T23:59:59+00:00',
            },
        },
    }: {
        children?: React.ReactNode
        aiAgentUserId?: string | null
        hasAutomate?: boolean
        statsFilters?: StatsFiltersWithLogicalOperator
    } = {}) => {
        useAppDispatchMock.mockReturnValue(dispatch)
        useAIAgentUserIdMock.mockReturnValue(
            aiAgentUserId === null ? undefined : aiAgentUserId
        )
        getHasAutomateMock.mockReturnValue(hasAutomate)
        getStatsFiltersWithLogicalOperatorsMock.mockReturnValue(statsFilters)
        return render(<AiAgentStatsFilters>{children}</AiAgentStatsFilters>)
    }

    it('should render child component when everything is setup correctly', () => {
        renderComponent()
        expect(screen.queryByText('child-component')).toBeInTheDocument()
    })

    it('should render AutomatePaywallView if hasAutomate is false', () => {
        renderComponent({hasAutomate: false})
        expect(screen.queryByText('automate-paywall-view')).toBeInTheDocument()
    })

    it('should render AiAgentStatsEmptyState if hasAutomate is true and aiAgentUserId is undefined ', () => {
        renderComponent({aiAgentUserId: null})

        expect(
            screen.queryByText('ai-agent-stats-empty-state')
        ).toBeInTheDocument()
    })

    it('should set correct filters on mount and restore on unmount', () => {
        const initialStatsFilters: StatsFiltersWithLogicalOperator = {
            period: {
                start_datetime: '2024-06-01T00:00:00+00:00',
                end_datetime: '2024-06-30T23:59:59+00:00',
            },
            channels: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['email', 'chat'],
            },
            agents: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [6, 9, 12],
            },
        }

        // Mount
        const {unmount} = renderComponent({
            statsFilters: initialStatsFilters,
        })

        expect(dispatch).toHaveBeenCalledWith(
            setStatsFiltersWithLogicalOperators({
                period: initialStatsFilters.period,
                agents: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [5],
                },
            })
        )

        // Unmount
        unmount()

        expect(dispatch).toHaveBeenCalledWith(
            setStatsFiltersWithLogicalOperators(initialStatsFilters)
        )
    })
})
