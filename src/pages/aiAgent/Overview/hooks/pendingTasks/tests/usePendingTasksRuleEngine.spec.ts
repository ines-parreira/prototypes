import {renderHook} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'

import {useFetchAiAgentStoreConfigurationData} from '../useFetchAiAgentStoreConfigurationData'
import {useFetchFaqHelpCentersData} from '../useFetchFaqHelpCentersData'
import {useFetchFileIngestionData} from '../useFetchFileIngestionData'
import {usePendingTasksRuleEngine} from '../usePendingTasksRuleEngine'
import {AiAgentStoreConfigurationFixture} from './AiAgentStoreConfiguration.fixture'
import {FileIngestionDataFixture} from './FileIngestionData.fixture'
import {HelpCenterDataFixture} from './HelpCenterData.fixture'

jest.mock('../useFetchFaqHelpCentersData', () => ({
    useFetchFaqHelpCentersData: jest.fn(),
}))
const useFetchFaqHelpCentersDataMock = assumeMock(useFetchFaqHelpCentersData)
jest.mock('../useFetchAiAgentStoreConfigurationData', () => ({
    useFetchAiAgentStoreConfigurationData: jest.fn(),
}))
const useFetchAiAgentStoreConfigurationDataMock = assumeMock(
    useFetchAiAgentStoreConfigurationData
)
jest.mock('../useFetchFileIngestionData', () => ({
    useFetchFileIngestionData: jest.fn(),
}))
const useFetchFileIngestionDataMock = assumeMock(useFetchFileIngestionData)

// Will implements better testing after extracting the list of tasks from the ruleEngine
describe('usePendingTasksRuleEngine', () => {
    useFetchFaqHelpCentersDataMock.mockReturnValue({
        isLoading: false,
        data: HelpCenterDataFixture.start().withNoHelpCenter().build(),
    })

    useFetchAiAgentStoreConfigurationDataMock.mockReturnValue({
        isLoading: false,
        data: AiAgentStoreConfigurationFixture.start()
            .withoutConnectedHelpCenter()
            .withChatChannelEnabled()
            .withEmailChannelEnabled()
            .build(),
    })

    useFetchFileIngestionDataMock.mockReturnValue({
        isLoading: false,
        data: FileIngestionDataFixture.start().withNoIngestedFile().build(),
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
        expect(hook.result.current.pendingTasks).toHaveLength(1)
    })
})
