import {useSelfServiceConfigurationUpdate} from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'

export const mockSelfServiceConfigurationUpdate: ReturnType<
    typeof useSelfServiceConfigurationUpdate
> = {
    isUpdatePending: false,
    handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
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
