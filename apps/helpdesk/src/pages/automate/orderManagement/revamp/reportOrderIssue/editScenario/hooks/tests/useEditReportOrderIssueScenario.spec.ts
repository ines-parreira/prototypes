import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'

import { useReportOrderIssueFlow } from '../../../scenarioList/hooks/useReportOrderIssueFlow'
import { useEditReportOrderIssueScenario } from '../useEditReportOrderIssueScenario'

const mockPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
    useParams: () => ({
        shopName: 'my-store',
        shopType: 'shopify',
        scenarioIndex: '1',
    }),
}))

jest.mock('../../../scenarioList/hooks/useReportOrderIssueFlow')

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
    {
        title: 'Fallback',
        description: 'Default scenario',
        conditions: { and: [] },
        newReasons: [],
    },
]

describe('useEditReportOrderIssueScenario', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useReportOrderIssueFlow as jest.Mock).mockReturnValue({
            isLoading: false,
            isUpdatePending: false,
            scenarios: existingScenarios,
            handleScenariosUpdate: mockHandleScenariosUpdate,
        })
    })

    it('should return the scenario at the given index', () => {
        const { result } = renderHook(() => useEditReportOrderIssueScenario())

        expect(result.current.scenario).toEqual(existingScenarios[1])
    })

    it('should return null when the scenario index is out of bounds', () => {
        ;(useReportOrderIssueFlow as jest.Mock).mockReturnValue({
            isLoading: false,
            isUpdatePending: false,
            scenarios: [],
            handleScenariosUpdate: mockHandleScenariosUpdate,
        })

        const { result } = renderHook(() => useEditReportOrderIssueScenario())

        expect(result.current.scenario).toBeNull()
    })

    it('should return isFallback as false when not the last scenario', () => {
        const { result } = renderHook(() => useEditReportOrderIssueScenario())

        expect(result.current.isFallback).toBe(false)
    })

    it('should return isFallback as true when the scenario is the last one', () => {
        ;(useReportOrderIssueFlow as jest.Mock).mockReturnValue({
            isLoading: false,
            isUpdatePending: false,
            scenarios: existingScenarios.slice(0, 2),
            handleScenariosUpdate: mockHandleScenariosUpdate,
        })

        const { result } = renderHook(() => useEditReportOrderIssueScenario())

        expect(result.current.isFallback).toBe(true)
    })

    it('should update the scenario at the correct index', async () => {
        const updatedScenario: SelfServiceReportIssueCase = {
            title: 'Updated',
            description: 'Updated description',
            conditions: { and: [] },
            newReasons: [],
        }

        const { result } = renderHook(() => useEditReportOrderIssueScenario())

        await act(async () => {
            await result.current.handleScenarioUpdate(updatedScenario)
        })

        const calledWith = mockHandleScenariosUpdate.mock.calls[0][0]
        expect(calledWith[0]).toEqual(existingScenarios[0])
        expect(calledWith[1]).toEqual(updatedScenario)
        expect(calledWith[2]).toEqual(existingScenarios[2])
        expect(mockHandleScenariosUpdate).toHaveBeenCalledWith(
            expect.any(Array),
            { success: 'Scenario saved', error: 'Failed to save scenario' },
        )
    })

    it('should delete the scenario and navigate back', async () => {
        const { result } = renderHook(() => useEditReportOrderIssueScenario())

        await act(async () => {
            await result.current.handleScenarioDelete()
        })

        const calledWith = mockHandleScenariosUpdate.mock.calls[0][0]
        expect(calledWith).toHaveLength(2)
        expect(calledWith).toEqual([existingScenarios[0], existingScenarios[2]])
        expect(mockPush).toHaveBeenCalledWith(
            '/app/settings/order-management/shopify/my-store/report-issue',
        )
    })

    it('should pass through isLoading from useReportOrderIssueFlow', () => {
        ;(useReportOrderIssueFlow as jest.Mock).mockReturnValue({
            isLoading: true,
            isUpdatePending: false,
            scenarios: [],
            handleScenariosUpdate: mockHandleScenariosUpdate,
        })

        const { result } = renderHook(() => useEditReportOrderIssueScenario())

        expect(result.current.isLoading).toBe(true)
    })

    it('should pass through isUpdatePending from useReportOrderIssueFlow', () => {
        ;(useReportOrderIssueFlow as jest.Mock).mockReturnValue({
            isLoading: false,
            isUpdatePending: true,
            scenarios: existingScenarios,
            handleScenariosUpdate: mockHandleScenariosUpdate,
        })

        const { result } = renderHook(() => useEditReportOrderIssueScenario())

        expect(result.current.isUpdatePending).toBe(true)
    })
})
