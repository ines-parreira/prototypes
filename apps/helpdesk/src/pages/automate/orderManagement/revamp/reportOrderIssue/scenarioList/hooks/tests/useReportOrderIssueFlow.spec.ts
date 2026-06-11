import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { selfServiceConfiguration1 as mockSelfServiceConfig } from 'fixtures/self_service_configurations'
import { useSelfServiceConfiguration } from 'pages/automate/common/hooks/useSelfServiceConfiguration'

import { useReportOrderIssueFlow } from '../useReportOrderIssueFlow'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'my-store' }),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

const mockHandleUpdate = jest.fn()

const configWithScenarios = {
    ...mockSelfServiceConfig,
    reportIssuePolicy: {
        enabled: true,
        cases: [
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
        ],
    },
}

describe('useReportOrderIssueFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: configWithScenarios,
            isFetchPending: false,
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: mockHandleUpdate,
        })
    })

    it('should return loading state when fetch is pending', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: null,
            isFetchPending: true,
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: mockHandleUpdate,
        })

        const { result } = renderHook(() => useReportOrderIssueFlow())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return loading when configuration is not yet available', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: undefined,
            isFetchPending: false,
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: mockHandleUpdate,
        })

        const { result } = renderHook(() => useReportOrderIssueFlow())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return scenarios from configuration', () => {
        const { result } = renderHook(() => useReportOrderIssueFlow())

        expect(result.current.scenarios).toEqual(
            configWithScenarios.reportIssuePolicy.cases,
        )
    })

    it('should return empty scenarios when configuration has no cases', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfig,
            isFetchPending: false,
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: mockHandleUpdate,
        })

        const { result } = renderHook(() => useReportOrderIssueFlow())

        expect(result.current.scenarios).toEqual([])
    })

    it('should call handleSelfServiceConfigurationUpdate when handleScenariosUpdate is called', async () => {
        const { result } = renderHook(() => useReportOrderIssueFlow())

        await act(async () => {
            await result.current.handleScenariosUpdate([])
        })

        expect(mockHandleUpdate).toHaveBeenCalledWith(expect.any(Function), {})
    })

    it('should update draft reportIssuePolicy cases with provided scenarios', async () => {
        const { result } = renderHook(() => useReportOrderIssueFlow())
        const newScenarios = [configWithScenarios.reportIssuePolicy.cases[1]]

        await act(async () => {
            await result.current.handleScenariosUpdate(newScenarios)
        })

        const draftUpdater = mockHandleUpdate.mock.calls[0][0]
        const draft = {
            reportIssuePolicy: {
                enabled: true,
                cases: [...configWithScenarios.reportIssuePolicy.cases],
            },
        }
        draftUpdater(draft)

        expect(draft.reportIssuePolicy.cases).toEqual(newScenarios)
    })
})
