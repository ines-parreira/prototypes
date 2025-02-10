import {renderHook} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'

import {useFetchAiAgentStoreConfigurationData} from '../useFetchAiAgentStoreConfigurationData'
import {useFetchHelpCenterData} from '../useFetchHelpCenterData'
import {usePendingTasksRuleEngine} from '../usePendingTasksRuleEngine'

jest.mock('../useFetchHelpCenterData', () => ({
    useFetchHelpCenterData: jest.fn(),
}))
const useFetchHelpCenterDataMock = assumeMock(useFetchHelpCenterData)
jest.mock('../useFetchAiAgentStoreConfigurationData', () => ({
    useFetchAiAgentStoreConfigurationData: jest.fn(),
}))
const useFetchAiAgentStoreConfigurationDataMock = assumeMock(
    useFetchAiAgentStoreConfigurationData
)

// Will implements better testing after extracting the list of tasks from the ruleEngine
describe('usePendingTasksRuleEngine', () => {
    useFetchHelpCenterDataMock.mockReturnValue({
        isLoading: false,
        data: [],
    })

    useFetchAiAgentStoreConfigurationDataMock.mockReturnValue({
        isLoading: false,
        data: {
            chatChannelDeactivatedDatetime: null,
            emailChannelDeactivatedDatetime: null,
        } as any,
    })
    it('should return valid tasks', () => {
        const hook = renderHook(() =>
            usePendingTasksRuleEngine({
                accountDomain: 'test',
                storeName: 'test',
            })
        )

        expect(hook.result.current.isLoading).toBe(false)
        expect(hook.result.current.completedTasks).toHaveLength(3)
        expect(hook.result.current.pendingTasks).toHaveLength(0)
    })
})
