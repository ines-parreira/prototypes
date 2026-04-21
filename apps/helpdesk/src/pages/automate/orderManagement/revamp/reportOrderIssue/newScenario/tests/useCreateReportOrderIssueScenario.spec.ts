import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'

import { useReportOrderIssueFlow } from '../../scenarioList/hooks/useReportOrderIssueFlow'
import { useCreateReportOrderIssueScenario } from '../hooks/useCreateReportOrderIssueScenario'

const mockPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
    useParams: () => ({ shopName: 'my-store', shopType: 'shopify' }),
}))

jest.mock('../../scenarioList/hooks/useReportOrderIssueFlow')

const mockHandleScenariosUpdate = jest.fn().mockResolvedValue(undefined)

const existingScenarios: SelfServiceReportIssueCase[] = [
    {
        title: 'Wrong item',
        description: 'Received wrong item',
        conditions: { and: [] },
        newReasons: [],
    },
    {
        title: 'Damaged item',
        description: 'Item arrived damaged',
        conditions: { and: [] },
        newReasons: [],
    },
]

const newScenario: SelfServiceReportIssueCase = {
    title: 'Missing item',
    description: 'Item is missing from order',
    conditions: { and: [] },
    newReasons: [],
}

describe('useCreateReportOrderIssueScenario', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useReportOrderIssueFlow as jest.Mock).mockReturnValue({
            isUpdatePending: false,
            scenarios: existingScenarios,
            handleScenariosUpdate: mockHandleScenariosUpdate,
        })
    })

    it('should return isCreatePending from isUpdatePending', () => {
        ;(useReportOrderIssueFlow as jest.Mock).mockReturnValue({
            isUpdatePending: true,
            scenarios: existingScenarios,
            handleScenariosUpdate: mockHandleScenariosUpdate,
        })

        const { result } = renderHook(() => useCreateReportOrderIssueScenario())

        expect(result.current.isCreatePending).toBe(true)
    })

    it('should prepend the new scenario to existing scenarios', async () => {
        const { result } = renderHook(() => useCreateReportOrderIssueScenario())

        await act(async () => {
            await result.current.handleScenarioCreate(newScenario)
        })

        expect(mockHandleScenariosUpdate).toHaveBeenCalledWith([
            newScenario,
            ...existingScenarios,
        ])
    })

    it('should navigate to the report-issue page after creating a scenario', async () => {
        const { result } = renderHook(() => useCreateReportOrderIssueScenario())

        await act(async () => {
            await result.current.handleScenarioCreate(newScenario)
        })

        expect(mockPush).toHaveBeenCalledWith(
            '/app/settings/order-management/shopify/my-store/report-issue',
        )
    })

    it('should pass the correct scenarios array to handleScenariosUpdate', async () => {
        const { result } = renderHook(() => useCreateReportOrderIssueScenario())

        await act(async () => {
            await result.current.handleScenarioCreate(newScenario)
        })

        const calledWith = mockHandleScenariosUpdate.mock.calls[0][0]
        expect(calledWith[0]).toEqual(newScenario)
        expect(calledWith.slice(1)).toEqual(existingScenarios)
        expect(calledWith).toHaveLength(existingScenarios.length + 1)
    })
})
