import type { ReactNode } from 'react'
import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { updateRule } from 'models/rule/resources'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useRules } from 'state/entities/rules/hooks'
import type { RulesState } from 'state/entities/rules/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { RuleType } from 'state/rules/types'

import { useAiAgentEnabled } from '../useAiAgentEnabled'

jest.mock('hooks/useAppDispatch')
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('models/rule/resources')
jest.mock('state/entities/rules/hooks')
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings')

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const store = mockStore({})

const useAppDispatchMock = assumeMock(useAppDispatch)
const useParamsMock = assumeMock(useParams)
const useRulesMock = assumeMock(useRules)
const useSelfServiceChatChannelsMock = assumeMock(useSelfServiceChatChannels)
const useApplicationsAutomationSettingsMock = assumeMock(
    useApplicationsAutomationSettings,
)

const defaultAutomationSettings = {
    isFetchPending: false,
    isUpdatePending: false,
}

const defaultChatApplicationAutomationSettings = {
    id: 1,
    applicationId: 1,
    articleRecommendation: { enabled: false },
    orderManagement: { enabled: false },
    workflows: {
        enabled: false,
    },
    createdDatetime: '2024-09-25',
    updatedDatetime: '2024-09-25',
}

const defaultSelfServeChatChannel = [
    {
        type: TicketChannel.Chat,
        value: {
            id: 1,
            meta: { app_id: 'app1' },
        } as GorgiasChatIntegration,
    },
] as SelfServiceChatChannel[]

const defaultRules = [
    {
        id: 1,
        type: RuleType.Managed,
        code: 'code',
        code_ast: null,
        deactivated_datetime: null,
        description: 'description',
        event_types: 'event',
        name: 'name',
        created_datetime: '2024-09-25',
        updated_datetime: '2024-09-25',
        uri: 'uri',
        priority: 1,
    },
] as unknown as RulesState

const DEFAULT_PARAMS: Parameters<typeof useAiAgentEnabled>[0] = {
    monitoredChatIntegrations: [],
    monitoredEmailIntegrations: [],
    isEnablingChatChannel: false,
    isEnablingEmailChannel: false,
}

describe('useAiAgentEnabled', () => {
    const dispatchMock = jest.fn()

    const wrapper = ({ children }: { children?: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    )

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useParamsMock.mockReturnValue({
            shopType: 'some-shop',
            shopName: 'some-name',
        })

        useRulesMock.mockReturnValue([null, false]) // No rules, not loading
        useSelfServiceChatChannelsMock.mockReturnValue([])
        useApplicationsAutomationSettingsMock.mockReturnValue({
            isUpdatePending: false,
            isFetchPending: false,
            applicationsAutomationSettings: {},
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })
    })

    it('should return updateSettingsAfterAiAgentEnabled function', () => {
        const { result } = renderHook(() => useAiAgentEnabled(DEFAULT_PARAMS), {
            wrapper,
        })

        expect(result.current.updateSettingsAfterAiAgentEnabled).toBeInstanceOf(
            Function,
        )
    })

    it('should not update anything when there are no integrations', () => {
        const { result } = renderHook(() => useAiAgentEnabled(DEFAULT_PARAMS), {
            wrapper,
        })

        result.current.updateSettingsAfterAiAgentEnabled()

        expect(dispatchMock).not.toHaveBeenCalled()
    })

    it('should update chat application settings when chat integrations are present', () => {
        const handleUpdateMock = jest.fn()
        useSelfServiceChatChannelsMock.mockReturnValue(
            defaultSelfServeChatChannel,
        )
        useApplicationsAutomationSettingsMock.mockReturnValue({
            ...defaultAutomationSettings,
            applicationsAutomationSettings: {
                app1: {
                    ...defaultChatApplicationAutomationSettings,
                    articleRecommendation: { enabled: true },
                },
            },
            handleChatApplicationAutomationSettingsUpdate: handleUpdateMock,
        })

        const { result } = renderHook(
            () =>
                useAiAgentEnabled({
                    ...DEFAULT_PARAMS,
                    monitoredChatIntegrations: [1],
                    isEnablingChatChannel: true,
                }),
            { wrapper },
        )

        result.current.updateSettingsAfterAiAgentEnabled()

        expect(handleUpdateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                ...defaultChatApplicationAutomationSettings,
                articleRecommendation: { enabled: false },
            }),
            undefined,
            true,
        )
    })

    it('should deactivate rules for email integrations', () => {
        useRulesMock.mockReturnValue([defaultRules, false])
        const { result } = renderHook(
            () =>
                useAiAgentEnabled({
                    ...DEFAULT_PARAMS,
                    isEnablingEmailChannel: true,
                    monitoredEmailIntegrations: [
                        { id: 1, email: 'test@example.com' },
                    ],
                }),
            { wrapper },
        )

        result.current.updateSettingsAfterAiAgentEnabled()

        expect(updateRule).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1 }),
        )
    })

    it('should dispatch success notification when chat updates succeed', () => {
        useSelfServiceChatChannelsMock.mockReturnValue(
            defaultSelfServeChatChannel,
        )
        const { result } = renderHook(
            () =>
                useAiAgentEnabled({
                    ...DEFAULT_PARAMS,
                    monitoredChatIntegrations: [1],
                    isEnablingChatChannel: true,
                }),
            { wrapper },
        )

        result.current.updateSettingsAfterAiAgentEnabled()

        void waitFor(() => {
            expect(dispatchMock).toHaveBeenCalled()
            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message:
                    'AI Agent enabled. Article Recommendations have been turned off to avoid conflicting responses.',
            })
        })
    })

    it('should dispatch success notification when email updates succeed', () => {
        useRulesMock.mockReturnValue([defaultRules, false])

        const { result } = renderHook(
            () =>
                useAiAgentEnabled({
                    ...DEFAULT_PARAMS,
                    isEnablingEmailChannel: true,
                    monitoredEmailIntegrations: [
                        { id: 1, email: 'test@example/com' },
                    ],
                }),
            { wrapper },
        )

        result.current.updateSettingsAfterAiAgentEnabled()

        void waitFor(() => {
            expect(dispatchMock).toHaveBeenCalled()
            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message:
                    'AI Agent enabled. Autoresponders have been turned off to avoid conflicting responses.',
            })
        })
    })

    it('should dispatch error notification when updates fail', () => {
        const handleUpdateMock = jest
            .fn()
            .mockRejectedValueOnce(new Error('Error'))
        useSelfServiceChatChannelsMock.mockReturnValue(
            defaultSelfServeChatChannel,
        )
        useApplicationsAutomationSettingsMock.mockReturnValue({
            ...defaultAutomationSettings,
            applicationsAutomationSettings: {
                app1: {
                    ...defaultChatApplicationAutomationSettings,
                    articleRecommendation: { enabled: true },
                },
            },
            handleChatApplicationAutomationSettingsUpdate: handleUpdateMock,
        })

        const { result } = renderHook(
            () =>
                useAiAgentEnabled({
                    ...DEFAULT_PARAMS,
                    isEnablingChatChannel: true,
                    monitoredChatIntegrations: [1],
                }),
            { wrapper },
        )

        result.current.updateSettingsAfterAiAgentEnabled()

        void waitFor(() => {
            expect(dispatchMock).toHaveBeenCalled()
            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: expect.stringContaining('There were some issues'),
            })
        })
    })

    it('should not update anything when email and chat channels disabled', () => {
        const handleUpdateMock = jest.fn()
        useSelfServiceChatChannelsMock.mockReturnValue(
            defaultSelfServeChatChannel,
        )
        useApplicationsAutomationSettingsMock.mockReturnValue({
            ...defaultAutomationSettings,
            applicationsAutomationSettings: {
                app1: {
                    ...defaultChatApplicationAutomationSettings,
                    articleRecommendation: { enabled: true },
                },
            },
            handleChatApplicationAutomationSettingsUpdate: handleUpdateMock,
        })

        const { result } = renderHook(
            () =>
                useAiAgentEnabled({
                    ...DEFAULT_PARAMS,
                    monitoredEmailIntegrations: [
                        { id: 1, email: 'test@mail.com' },
                    ],
                    monitoredChatIntegrations: [1],
                    isEnablingChatChannel: false,
                    isEnablingEmailChannel: false,
                }),
            { wrapper },
        )

        result.current.updateSettingsAfterAiAgentEnabled()

        expect(handleUpdateMock).not.toHaveBeenCalled()
        expect(updateRule).not.toHaveBeenCalled()
    })
})
