import {useSelfServiceConfigurationUpdate} from 'pages/automation/common/hooks/useSelfServiceConfigurationUpdate'
import useWorkflowApi from '../../useWorkflowApi'
import {mockWorkflowConfiguration} from './utils'

export const mockSelfServiceConfigurationUpdate: ReturnType<
    typeof useSelfServiceConfigurationUpdate
> = {
    isUpdatePending: false,
    handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
} as const

export const mockWorkflowApi: Partial<ReturnType<typeof useWorkflowApi>> = {
    isFetchPending: false,
    isUpdatePending: false,
    fetchWorkflowConfigurations: () => {
        return Promise.resolve([
            mockWorkflowConfiguration('a'),
            mockWorkflowConfiguration('b'),
            mockWorkflowConfiguration('c'),
        ])
    },
    duplicateWorkflowConfiguration: jest.fn().mockResolvedValue({id: 4}),
    deleteWorkflowConfiguration: jest.fn(() => Promise.resolve()),
} as const

export function useSelfServiceConfigurationUpdateMockSetter(
    overrides: Partial<ReturnType<typeof useSelfServiceConfigurationUpdate>>
) {
    ;(
        useSelfServiceConfigurationUpdate as jest.MockedFn<
            typeof useSelfServiceConfigurationUpdate
        >
    ).mockReturnValue({
        ...mockSelfServiceConfigurationUpdate,
        ...overrides,
    })
}

export function useWorkflowApiMockSetter() {
    ;(useWorkflowApi as jest.MockedFn<typeof useWorkflowApi>).mockReturnValue(
        mockWorkflowApi as ReturnType<typeof useWorkflowApi>
    )
}
