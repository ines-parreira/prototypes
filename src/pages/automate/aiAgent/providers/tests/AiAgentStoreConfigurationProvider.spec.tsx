import React from 'react'
import {fromJS} from 'immutable'
import {useParams} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import {act, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {account} from 'fixtures/account'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock, createContextConsumer} from 'utils/testing'
import {StoreConfiguration} from 'models/aiAgent/types'
import AiAgentStoreConfigurationProvider from '../AiAgentStoreConfigurationProvider'
import AiAgentStoreConfigurationContext from '../AiAgentStoreConfigurationContext'
import {useStoreConfigurationMutation} from '../../hooks/useStoreConfigurationMutation'
import {useStoreConfiguration} from '../../hooks/useStoreConfiguration'

const mockStore = configureMockStore<RootState, StoreDispatch>()

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))
const useParamsMock = assumeMock(useParams)

jest.mock('../../hooks/useStoreConfigurationMutation')
const useStoreConfigurationMutationMock = assumeMock(
    useStoreConfigurationMutation
)

jest.mock('../../hooks/useStoreConfiguration')
const useStoreConfigurationMock = assumeMock(useStoreConfiguration)

const defaultState = {
    currentAccount: fromJS(account),
} as RootState

const AiAgentStoreConfigurationConsumer = createContextConsumer(
    AiAgentStoreConfigurationContext
)

const mockStoreConfiguration: StoreConfiguration = {
    deactivatedDatetime: null,
    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
    storeName: 'test-shop',
    helpCenterId: 1,
    snippetHelpCenterId: 1,
    guidanceHelpCenterId: 1,
    toneOfVoice: 'Friendly',
    customToneOfVoiceGuidance:
        "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.",
    signature: 'This response was created by AI',
    excludedTopics: [],
    tags: [],
    conversationBot: {
        id: 1,
        email: 'test@mail.com',
    },
    monitoredEmailIntegrations: [],
    silentHandover: false,
    ticketSampleRate: 100,
    dryRun: false,
    isDraft: false,
}

describe('AiAgentStoreConfigurationProvider', () => {
    beforeAll(() => {
        useParamsMock.mockReturnValue({shopName: 'shop-1'})

        useStoreConfigurationMutationMock.mockReturnValue({
            isLoading: false,
            createStoreConfiguration: jest.fn(),
            upsertStoreConfiguration: jest.fn(),
            error: null,
        })
    })

    it('passes down an undefined storeConfiguration', () => {
        useStoreConfigurationMock.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: false,
        })

        const {rerender} = render(
            <Provider store={mockStore(defaultState)}>
                <AiAgentStoreConfigurationProvider>
                    <AiAgentStoreConfigurationConsumer />
                </AiAgentStoreConfigurationProvider>
            </Provider>
        )

        expect(AiAgentStoreConfigurationConsumer.getLastContextValue()).toEqual(
            {
                storeConfiguration: undefined,
                createStoreConfiguration: expect.any(Function),
                updateStoreConfiguration: expect.any(Function),
                isLoading: false,
                isPendingCreateOrUpdate: false,
            }
        )

        useStoreConfigurationMock.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: true,
        })

        rerender(
            <Provider store={mockStore(defaultState)}>
                <AiAgentStoreConfigurationProvider>
                    <AiAgentStoreConfigurationConsumer />
                </AiAgentStoreConfigurationProvider>
            </Provider>
        )

        expect(AiAgentStoreConfigurationConsumer.getLastContextValue()).toEqual(
            {
                storeConfiguration: undefined,
                createStoreConfiguration: expect.any(Function),
                updateStoreConfiguration: expect.any(Function),
                isLoading: true,
                isPendingCreateOrUpdate: false,
            }
        )
    })

    it('creates the storeConfiguration', async () => {
        useStoreConfigurationMock.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: false,
        })

        const mockCreateStoreConfiguration = jest
            .fn()
            .mockResolvedValue(mockStoreConfiguration)

        useStoreConfigurationMutationMock.mockReturnValue({
            isLoading: false,
            createStoreConfiguration: mockCreateStoreConfiguration,
            upsertStoreConfiguration: jest.fn(),
            error: null,
        })

        const {rerender} = render(
            <Provider store={mockStore(defaultState)}>
                <AiAgentStoreConfigurationProvider>
                    <AiAgentStoreConfigurationConsumer />
                </AiAgentStoreConfigurationProvider>
            </Provider>
        )

        expect(
            AiAgentStoreConfigurationConsumer.getLastContextValue()
                ?.storeConfiguration
        ).toBeUndefined()

        const createConfigurationPayload = {
            deactivatedDatetime: null,
            trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
            storeName: 'test-shop',
            helpCenterId: 1,
            customToneOfVoiceGuidance:
                "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.",
            signature: 'This response was created by AI',
            monitoredEmailIntegrations: [],
        }

        await act(
            () =>
                AiAgentStoreConfigurationConsumer.getLastContextValue()?.createStoreConfiguration(
                    createConfigurationPayload
                ) ?? Promise.resolve()
        )

        expect(mockCreateStoreConfiguration).toHaveBeenCalledWith(
            createConfigurationPayload
        )

        useStoreConfigurationMutationMock.mockReturnValue({
            isLoading: true,
            createStoreConfiguration: jest.fn(),
            upsertStoreConfiguration: jest.fn(),
            error: null,
        })

        rerender(
            <Provider store={mockStore(defaultState)}>
                <AiAgentStoreConfigurationProvider>
                    <AiAgentStoreConfigurationConsumer />
                </AiAgentStoreConfigurationProvider>
            </Provider>
        )

        expect(
            AiAgentStoreConfigurationConsumer.getLastContextValue()
                ?.isPendingCreateOrUpdate
        ).toEqual(true)

        useStoreConfigurationMutationMock.mockReturnValue({
            isLoading: false,
            createStoreConfiguration: jest.fn(),
            upsertStoreConfiguration: jest.fn(),
            error: null,
        })

        rerender(
            <Provider store={mockStore(defaultState)}>
                <AiAgentStoreConfigurationProvider>
                    <AiAgentStoreConfigurationConsumer />
                </AiAgentStoreConfigurationProvider>
            </Provider>
        )

        expect(
            AiAgentStoreConfigurationConsumer.getLastContextValue()
                ?.isPendingCreateOrUpdate
        ).toEqual(false)
    })

    it('updates the storeConfiguration', async () => {
        useStoreConfigurationMock.mockReturnValue({
            storeConfiguration: mockStoreConfiguration,
            isLoading: false,
        })

        const mockUpdateStoreConfiguration = jest
            .fn()
            .mockImplementation(
                (upsertPayload: StoreConfiguration) => upsertPayload
            )

        useStoreConfigurationMutationMock.mockReturnValue({
            isLoading: false,
            createStoreConfiguration: jest.fn(),
            upsertStoreConfiguration: mockUpdateStoreConfiguration,
            error: null,
        })

        const {rerender} = render(
            <Provider store={mockStore(defaultState)}>
                <AiAgentStoreConfigurationProvider>
                    <AiAgentStoreConfigurationConsumer />
                </AiAgentStoreConfigurationProvider>
            </Provider>
        )

        expect(
            AiAgentStoreConfigurationConsumer.getLastContextValue()
                ?.storeConfiguration
        ).toEqual(mockStoreConfiguration)

        const updateConfigurationPayload = {
            ...mockStoreConfiguration,
            signature: 'This signature is updated',
        }

        await act(
            () =>
                AiAgentStoreConfigurationConsumer.getLastContextValue()?.updateStoreConfiguration(
                    updateConfigurationPayload
                ) ?? Promise.resolve()
        )

        expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
            updateConfigurationPayload
        )

        useStoreConfigurationMutationMock.mockReturnValue({
            isLoading: true,
            createStoreConfiguration: jest.fn(),
            upsertStoreConfiguration: jest.fn(),
            error: null,
        })

        rerender(
            <Provider store={mockStore(defaultState)}>
                <AiAgentStoreConfigurationProvider>
                    <AiAgentStoreConfigurationConsumer />
                </AiAgentStoreConfigurationProvider>
            </Provider>
        )

        expect(
            AiAgentStoreConfigurationConsumer.getLastContextValue()
                ?.isPendingCreateOrUpdate
        ).toEqual(true)

        useStoreConfigurationMutationMock.mockReturnValue({
            isLoading: false,
            createStoreConfiguration: jest.fn(),
            upsertStoreConfiguration: jest.fn(),
            error: null,
        })

        rerender(
            <Provider store={mockStore(defaultState)}>
                <AiAgentStoreConfigurationProvider>
                    <AiAgentStoreConfigurationConsumer />
                </AiAgentStoreConfigurationProvider>
            </Provider>
        )

        expect(
            AiAgentStoreConfigurationConsumer.getLastContextValue()
                ?.isPendingCreateOrUpdate
        ).toEqual(false)
    })
})
