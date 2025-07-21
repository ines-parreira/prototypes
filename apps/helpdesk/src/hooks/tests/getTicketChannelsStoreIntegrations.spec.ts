import { useGetAiAgentIntegrations } from 'hooks/aiAgent/useGetAiAgentIntegrations'
import { useGetChatIntegrationIdsForStore } from 'hooks/chat/useGetChatIntegrationIdsForStore'
import { useGetContactFromIntegrationIdsForStore } from 'hooks/contacForm/useGetContactForms'
import {
    useGetEmail,
    useGetEmailIntegrationsWithStoreName,
} from 'hooks/email/useGetEmail'
import { useGetHelpCentersIntegrationIdsForStore } from 'hooks/helpCenter/useGetStoreHelpCenters'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/aiAgent/useGetAiAgentIntegrations')
jest.mock('hooks/chat/useGetChatIntegrationIdsForStore')
jest.mock('hooks/contacForm/useGetContactForms')
jest.mock('hooks/email/useGetEmail')
jest.mock('hooks/helpCenter/useGetStoreHelpCenters')

const useGetAiAgentIntegrationsMock = assumeMock(useGetAiAgentIntegrations)
const getChatIntegrationIdsForStoreMock = assumeMock(
    useGetChatIntegrationIdsForStore,
)
const useGetContactFromIntegrationIdsForStoreMock = assumeMock(
    useGetContactFromIntegrationIdsForStore,
)
const useGetEmailMock = assumeMock(useGetEmail)
const useGetEmailIntegrationsWithStoreNameMock = assumeMock(
    useGetEmailIntegrationsWithStoreName,
)
const useGetHelpCentersIntegrationIdsForStoreMock = assumeMock(
    useGetHelpCentersIntegrationIdsForStore,
)

describe('getTicketChannelsStoreIntegrations', () => {
    const shopName = 'shop1'
    const mockHelpCentersIntegrations = {
        helpCentersIntegrationsWithName: [
            { id: 1, channel: 'help_center' },
            { id: 2, channel: 'help_center' },
        ],
        helpCentersIntegrationsWithoutName: [
            { id: null, email_id: 101, channel: 'help_center' },
        ],
    }
    const mockContactFormIntegrations = {
        contactFormIntegrationsWithoutName: [
            { id: 9, channel: 'contact-form', email_id: 101 },
        ],
        contactFormIntegrationsWithName: [],
    }
    const mockEmailIntegrations = {
        emailIntegrationsWithoutName: [
            { id: 10, email_id: 105, channel: 'email' },
        ],
    }
    const mockChatChannels = [
        { id: 5, channel: 'chat' },
        { id: 6, channel: 'chat' },
    ]
    const mockAiAgentIntegrations = [
        { id: 7, channel: 'chat' },
        { id: 8, channel: 'chat' },
    ]
    const mockEmailIntegrationsWithStoreNamePerStore = [
        {
            id: 9,
            channel: 'contact-form',
            storeName: shopName,
        },
        {
            id: 10,
            channel: 'email',
            storeName: shopName,
        },
    ]

    beforeEach(() => {
        useGetHelpCentersIntegrationIdsForStoreMock.mockReturnValue(
            mockHelpCentersIntegrations,
        )
        useGetContactFromIntegrationIdsForStoreMock.mockReturnValue(
            mockContactFormIntegrations,
        )
        useGetEmailMock.mockReturnValue(mockEmailIntegrations)
        getChatIntegrationIdsForStoreMock.mockReturnValue(mockChatChannels)
        useGetAiAgentIntegrationsMock.mockReturnValue(mockAiAgentIntegrations)
        useGetEmailIntegrationsWithStoreNameMock.mockReturnValue(
            mockEmailIntegrationsWithStoreNamePerStore,
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return all integrations when they are available', () => {
        const { result } = renderHook(() =>
            useGetTicketChannelsStoreIntegrations(shopName),
        )
        expect(result.current).toEqual([
            'help_center::1',
            'help_center::2',
            'chat::5',
            'chat::6',
            'chat::7',
            'chat::8',
            'contact-form::9',
            'email::10',
        ])
    })

    it("should return '-1' when no integrations are available", () => {
        useGetHelpCentersIntegrationIdsForStoreMock.mockReturnValue({
            helpCentersIntegrationsWithName: [],
            helpCentersIntegrationsWithoutName: [],
        })
        useGetContactFromIntegrationIdsForStoreMock.mockReturnValue({
            contactFormIntegrationsWithName: [],
            contactFormIntegrationsWithoutName: [],
        })
        useGetEmailMock.mockReturnValue({
            emailIntegrationsWithoutName: [],
        })
        getChatIntegrationIdsForStoreMock.mockReturnValue([])
        useGetAiAgentIntegrationsMock.mockReturnValue([])
        useGetEmailIntegrationsWithStoreNameMock.mockReturnValue([])

        const { result } = renderHook(() =>
            useGetTicketChannelsStoreIntegrations(shopName),
        )
        expect(result.current).toEqual(['none::-1'])
    })
})
