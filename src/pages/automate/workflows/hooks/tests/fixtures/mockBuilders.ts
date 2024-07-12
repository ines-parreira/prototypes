import {useSelfServiceConfigurationUpdate} from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'
import useWorkflowApi from '../../useWorkflowApi'

export const mockSelfServiceConfigurationUpdate: ReturnType<
    typeof useSelfServiceConfigurationUpdate
> = {
    isUpdatePending: false,
    handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
} as const

export const mockWorkflowApi: Partial<ReturnType<typeof useWorkflowApi>> = {
    isFetchPending: false,
    isUpdatePending: false,
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
