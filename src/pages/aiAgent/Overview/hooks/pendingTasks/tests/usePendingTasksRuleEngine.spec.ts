import {renderHook} from '@testing-library/react-hooks'

import {AiAgentScope} from 'models/aiAgent/types'
import {assumeMock} from 'utils/testing'

import {useFetchActionsData} from '../useFetchActionsData'
import {useFetchAiAgentPlaygroundExecutionsData} from '../useFetchAiAgentPlaygroundExecutionsData'
import {useFetchAiAgentStoreConfigurationData} from '../useFetchAiAgentStoreConfigurationData'
import {useFetchEmailIntegrationsData} from '../useFetchEmailIntegrationsData'
import {useFetchFaqHelpCentersData} from '../useFetchFaqHelpCentersData'
import {useFetchFileIngestionData} from '../useFetchFileIngestionData'
import {useFetchGuidancesData} from '../useFetchGuidancesData'
import {usePendingTasksRuleEngine} from '../usePendingTasksRuleEngine'
import {ActionsDataFixture} from './ActionsData.fixture'
import {AiAgentPlaygroundExecutionsDataFixture} from './AiAgentPlaygroundExecutionsData.fixture'
import {AiAgentStoreConfigurationFixture} from './AiAgentStoreConfiguration.fixture'
import {EmailIntegrationsDataFixture} from './EmailIntegrationsData.fixture'
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
jest.mock('../useFetchAiAgentPlaygroundExecutionsData', () => ({
    useFetchAiAgentPlaygroundExecutionsData: jest.fn(),
}))
const useFetchAiAgentPlaygroundExecutionsDataMock = assumeMock(
    useFetchAiAgentPlaygroundExecutionsData
)
jest.mock('../useFetchEmailIntegrationsData', () => ({
    useFetchEmailIntegrationsData: jest.fn(),
}))
const useFetchEmailIntegrationsDataMock = assumeMock(
    useFetchEmailIntegrationsData
)

// Will implements better testing after extracting the list of tasks from the ruleEngine
describe('usePendingTasksRuleEngine', () => {
    useFetchFaqHelpCentersDataMock.mockReturnValue({
        isLoading: false,
        data: HelpCenterDataFixture.start().withNoHelpCenter().build(),
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

    useFetchAiAgentPlaygroundExecutionsDataMock.mockReturnValue({
        isLoading: false,
        data: AiAgentPlaygroundExecutionsDataFixture.start()
            .withoutExecution()
            .build(),
    })

    useFetchEmailIntegrationsDataMock.mockReturnValue({
        isLoading: false,
        data: EmailIntegrationsDataFixture.start()
            .withoutEmailIntegrations()
            .build(),
    })

    it.each([
        {
            scopes: [AiAgentScope.Support, AiAgentScope.Sales],
            pendingTasks: 4,
            completedTasks: 9,
        },
        {
            scopes: [AiAgentScope.Support],
            pendingTasks: 4,
            completedTasks: 9,
        },
        {
            scopes: [AiAgentScope.Sales],
            pendingTasks: 3,
            completedTasks: 6,
        },
    ])(
        'should return valid tasks for scopes $scopes',
        ({scopes, completedTasks, pendingTasks}) => {
            useFetchAiAgentStoreConfigurationDataMock.mockReturnValue({
                isLoading: false,
                data: AiAgentStoreConfigurationFixture.start()
                    .withScopes(scopes)
                    .withoutConnectedHelpCenter()
                    .withChatChannelEnabled()
                    .withEmailChannelEnabled()
                    .withoutHandoverTopic()
                    .build(),
            })

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
            ).toHaveLength(pendingTasks)
            expect(
                // Mapping on title to ease reading error report
                hook.result.current.completedTasks.map((t) => t.title)
            ).toHaveLength(completedTasks)
        }
    )
})
