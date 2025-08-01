import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import { AiAgentScope } from 'models/aiAgent/types'
import { useGetAlreadyUsedEmailIntegrationIds } from 'pages/aiAgent/hooks/useGetAlreadyUsedEmailIntegrationIds'
import { ShopifyPermissionsDataFixture } from 'pages/aiAgent/Overview/hooks/pendingTasks/tests/ShopifyPermissionsData.fixture'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { useFetchActionsData } from '../useFetchActionsData'
import { useFetchAiAgentPlaygroundExecutionsData } from '../useFetchAiAgentPlaygroundExecutionsData'
import { useFetchAiAgentStoreConfigurationData } from '../useFetchAiAgentStoreConfigurationData'
import { useFetchChatIntegrationsStatusData } from '../useFetchChatIntegrationsStatusData'
import { useFetchEmailIntegrationsData } from '../useFetchEmailIntegrationsData'
import { useFetchFaqHelpCentersData } from '../useFetchFaqHelpCentersData'
import { useFetchFileIngestionData } from '../useFetchFileIngestionData'
import { useFetchGuidancesData } from '../useFetchGuidancesData'
import { useFetchPageInteractionsData } from '../useFetchPageInteractionsData'
import { useFetchStoreKnowledgeStatusData } from '../useFetchStoreKnowledgeStatusData'
import { usePendingTasksRuleEngine } from '../usePendingTasksRuleEngine'
import { useShopifyPermissionsData } from '../useShopifyPermissionsData'
import { useTicketViewData } from '../useTicketViewData'
import { ActionsDataFixture } from './ActionsData.fixture'
import { AiAgentPlaygroundExecutionsDataFixture } from './AiAgentPlaygroundExecutionsData.fixture'
import { AiAgentStoreConfigurationFixture } from './AiAgentStoreConfiguration.fixture'
import { ChatIntegrationsStatusDataFixture } from './ChatIntegrationsStatusData.fixture'
import { EmailIntegrationsDataFixture } from './EmailIntegrationsData.fixture'
import { FileIngestionDataFixture } from './FileIngestionData.fixture'
import { GuidancesDataFixture } from './GuidancesData.fixture'
import { HelpCenterDataFixture } from './HelpCenterData.fixture'
import { PageInteractionsDataFixture } from './PageInteractionsData.fixture'

jest.mock('../useFetchFaqHelpCentersData', () => ({
    useFetchFaqHelpCentersData: jest.fn(),
}))
const useFetchFaqHelpCentersDataMock = assumeMock(useFetchFaqHelpCentersData)
jest.mock('../useFetchAiAgentStoreConfigurationData', () => ({
    useFetchAiAgentStoreConfigurationData: jest.fn(),
}))
jest.mock('../useFetchStoreKnowledgeStatusData', () => ({
    useFetchStoreKnowledgeStatusData: jest.fn(),
}))
const useFetchStoreKnowledgeStatusDataMock = assumeMock(
    useFetchStoreKnowledgeStatusData,
)
jest.mock('../useFetchAiAgentStoreConfigurationData', () => ({
    useFetchAiAgentStoreConfigurationData: jest.fn(),
}))
const useFetchAiAgentStoreConfigurationDataMock = assumeMock(
    useFetchAiAgentStoreConfigurationData,
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
    useFetchAiAgentPlaygroundExecutionsData,
)
jest.mock('../useFetchEmailIntegrationsData', () => ({
    useFetchEmailIntegrationsData: jest.fn(),
}))
const useFetchEmailIntegrationsDataMock = assumeMock(
    useFetchEmailIntegrationsData,
)
jest.mock('../useShopifyPermissionsData', () => ({
    useShopifyPermissionsData: jest.fn(),
}))
const useShopifyPermissionsDataMock = assumeMock(useShopifyPermissionsData)
jest.mock('../useFetchChatIntegrationsStatusData', () => ({
    useFetchChatIntegrationsStatusData: jest.fn(),
}))
const useFetchChatIntegrationsStatusDataMock = assumeMock(
    useFetchChatIntegrationsStatusData,
)
jest.mock('../useFetchPageInteractionsData', () => ({
    useFetchPageInteractionsData: jest.fn(),
}))
const useFetchPageInteractionsDataMock = assumeMock(
    useFetchPageInteractionsData,
)
jest.mock('pages/aiAgent/hooks/useGetAlreadyUsedEmailIntegrationIds')
const useGetAlreadyUsedEmailIntegrationIdsMock = assumeMock(
    useGetAlreadyUsedEmailIntegrationIds,
)

jest.mock('../useTicketViewData', () => ({
    useTicketViewData: jest.fn(),
}))
const useTicketViewDataMock = assumeMock(useTicketViewData)

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () =>
    jest.fn(),
)
const useSelfServiceChatChannelsMock = assumeMock(useSelfServiceChatChannels)

// Will implements better testing after extracting the list of tasks from the ruleEngine
describe('usePendingTasksRuleEngine', () => {
    useFetchFaqHelpCentersDataMock.mockReturnValue({
        isLoading: false,
        isFetched: true,
        data: HelpCenterDataFixture.start().withNoHelpCenter().build(),
    })

    useFetchStoreKnowledgeStatusDataMock.mockReturnValue({
        isLoading: false,
        data: undefined,
    })

    useFetchFileIngestionDataMock.mockReturnValue({
        isLoading: false,
        isFetched: true,
        data: FileIngestionDataFixture.start()
            .withSuccessfulIngestedFile()
            .build(),
    })

    useFetchGuidancesDataMock.mockReturnValue({
        isLoading: false,
        isFetched: true,

        data: GuidancesDataFixture.start().withPublicGuidance().build(),
    })

    useFetchActionsDataMock.mockReturnValue({
        isLoading: false,
        isFetched: true,
        data: ActionsDataFixture.start().withoutAction().build(),
    })

    useFetchAiAgentPlaygroundExecutionsDataMock.mockReturnValue({
        isLoading: false,
        isFetched: true,
        data: AiAgentPlaygroundExecutionsDataFixture.start()
            .withoutExecution()
            .build(),
    })

    useFetchEmailIntegrationsDataMock.mockReturnValue({
        data: EmailIntegrationsDataFixture.start()
            .withoutEmailIntegrations()
            .build(),
    })

    useGetAlreadyUsedEmailIntegrationIdsMock.mockReturnValue([])

    useShopifyPermissionsDataMock.mockReturnValue({
        data: ShopifyPermissionsDataFixture.start()
            .withHasRequiredPermission()
            .build(),
    })

    useFetchChatIntegrationsStatusDataMock.mockReturnValue({
        isLoading: false,
        isFetched: true,
        data: ChatIntegrationsStatusDataFixture.start()
            .withoutChatIntegrationStatus()
            .build(),
    })

    useTicketViewDataMock.mockReturnValue({
        isLoading: false,
        data: {},
    })

    useSelfServiceChatChannelsMock.mockReturnValue([])

    useFetchPageInteractionsDataMock.mockReturnValue({
        isLoading: false,
        isFetched: true,
        data: PageInteractionsDataFixture.start()
            .withoutPageInteraction()
            .withConvertChatInstallSnippetEnabled()
            .build(),
    })

    it.each([
        {
            scopes: [AiAgentScope.Support, AiAgentScope.Sales],
            pendingTasks: 6,
            completedTasks: 17,
        },
        {
            scopes: [AiAgentScope.Support],
            pendingTasks: 5,
            completedTasks: 14,
        },
        {
            scopes: [AiAgentScope.Sales],
            pendingTasks: 4,
            completedTasks: 11,
        },
    ])(
        'should return valid tasks for scopes $scopes',
        ({ scopes, completedTasks, pendingTasks }) => {
            useFetchAiAgentStoreConfigurationDataMock.mockReturnValue({
                error: undefined,
                isLoading: false,
                isFetched: true,
                data: AiAgentStoreConfigurationFixture.start()
                    .withCreatedDatetime(
                        moment().subtract(10, 'days').toISOString(),
                    )
                    .withoutConnectedChatIntegrations()
                    .withoutConnectedEmailIntegrations()
                    .withScopes(scopes)
                    .withoutConnectedHelpCenter()
                    .withChatChannelEnabled()
                    .withEmailChannelEnabled()
                    .build(),
            })

            const hook = renderHook(() =>
                usePendingTasksRuleEngine({
                    accountDomain: 'test',
                    storeName: 'test',
                    storeType: 'shopify',
                }),
            )

            expect(hook.result.current.isLoading).toBe(false)
            expect(
                // Mapping on title to ease reading error report
                hook.result.current.pendingTasks.map((t) => t.title),
            ).toHaveLength(pendingTasks)
            expect(
                // Mapping on title to ease reading error report
                hook.result.current.completedTasks.map((t) => t.title),
            ).toHaveLength(completedTasks)
        },
    )

    it('should return the onboarding task if the store is in error', () => {
        useFetchAiAgentStoreConfigurationDataMock.mockReturnValue({
            error: {},
            isLoading: false,
            isFetched: true,
            data: undefined,
        })

        const hook = renderHook(() =>
            usePendingTasksRuleEngine({
                accountDomain: 'test',
                storeName: 'test',
                storeType: 'shopify',
            }),
        )

        expect(hook.result.current.isLoading).toBe(false)
        expect(
            // Mapping on title to ease reading error report
            hook.result.current.pendingTasks.map((t) => t.title)[0],
        ).toBe('Start your onboarding flow')
        expect(hook.result.current.completedTasks).toHaveLength(0)
        expect(hook.result.current.pendingTasks).toHaveLength(1)
    })
})
