import {renderHook} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'

import {useFetchActionsData} from '../useFetchActionsData'
import {useFetchAiAgentStoreConfigurationData} from '../useFetchAiAgentStoreConfigurationData'
import {useFetchFaqHelpCentersData} from '../useFetchFaqHelpCentersData'
import {useFetchFileIngestionData} from '../useFetchFileIngestionData'
import {useFetchGuidancesData} from '../useFetchGuidancesData'
import {usePendingTasksRuleEngine} from '../usePendingTasksRuleEngine'
import {ActionsDataFixture} from './ActionsData.fixture'
import {AiAgentStoreConfigurationFixture} from './AiAgentStoreConfiguration.fixture'
import {FileIngestionDataFixture} from './FileIngestionData.fixture'
import {GuidancesDataFixture} from './GuidancesData.fixture'
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
jest.mock('../useFetchGuidancesData', () => ({
    useFetchGuidancesData: jest.fn(),
}))
const useFetchGuidancesDataMock = assumeMock(useFetchGuidancesData)
jest.mock('../useFetchActionsData', () => ({
    useFetchActionsData: jest.fn(),
}))
const useFetchActionsDataMock = assumeMock(useFetchActionsData)

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
            .withoutHandoverTopic()
            .build(),
    })

    useFetchFileIngestionDataMock.mockReturnValue({
        isLoading: false,
        data: FileIngestionDataFixture.start()
            .withSuccessfulIngestedFile()
            .build(),
    })

    useFetchGuidancesDataMock.mockReturnValue({
        isLoading: false,
        data: GuidancesDataFixture.start().withPublicGuidance().build(),
    })

    useFetchActionsDataMock.mockReturnValue({
        isLoading: false,
        data: ActionsDataFixture.start().withoutAction().build(),
    })

    it('should return valid tasks', () => {
        const hook = renderHook(() =>
            usePendingTasksRuleEngine({
                accountDomain: 'test',
                storeName: 'test',
            })
        )

        expect(hook.result.current.isLoading).toBe(false)
        expect(
            // Mapping on title to ease reading error report
            hook.result.current.pendingTasks.map((t) => t.title)
        ).toHaveLength(3)
        expect(
            // Mapping on title to ease reading error report
            hook.result.current.completedTasks.map((t) => t.title)
        ).toHaveLength(8)
    })
})
