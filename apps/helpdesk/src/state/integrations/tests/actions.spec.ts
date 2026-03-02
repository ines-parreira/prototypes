import { history } from '@repo/routing'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { getGorgiasChatProtectedApiClient } from 'rest_api/gorgias_chat_protected_api/client'
import type { Client } from 'rest_api/gorgias_chat_protected_api/client.generated'
import type { InstallationStatus } from 'rest_api/gorgias_chat_protected_api/types'
import * as constants from 'state/integrations/constants'

import client from '../../../models/api/resources'
import type { Integration } from '../../../models/integration/types'
import {
    GorgiasChatStatusEnum,
    IntegrationType,
} from '../../../models/integration/types'
import type { StoreDispatch } from '../../types'
import * as actions from '../actions'
import * as gorgiasChatActions from '../actions/gorgias-chat.actions'
import * as helpers from '../helpers'
import { initialState } from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: unknown) => args),
    }
})
jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
        replace: jest.fn(),
    },
}))
;(window as unknown as { location: Location }).location = {
    pathname: '/integration/1',
} as unknown as Location

const neutralInstallationStatus: InstallationStatus = {
    applicationId: 1,
    hasBeenRequestedOnce: true,
    installed: true,
    installedOnShopifyCheckout: true,
    embeddedSpqInstalled: false,
    minimumSnippetVersion: null,
    isDuringBusinessHours: false,
}

describe('integrations actions', () => {
    let store: MockStoreEnhanced<unknown, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({ integrations: initialState })
        mockServer = new MockAdapter(client)
    })

    it('fetch integrations', () => {
        mockServer
            .onGet('/api/integrations')
            .reply(200, { data: [{ id: 1, name: 'http' }], meta: {} })

        return store
            .dispatch(actions.fetchIntegrations())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('should do some action and redirect correctly on create email success', () => {
        const integration = {
            id: 1,
            type: IntegrationType.Email,
        } as Integration

        const p = history.push
        let logUrl = ''

        history.push = (url: string) => (logUrl = url)

        actions.onCreateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
        expect(logUrl).toMatchSnapshot()

        history.push = p
    })

    it('should do some action and redirect correctly on create gorgias chat success', () => {
        const integration = {
            id: 1,
            type: IntegrationType.GorgiasChat,
        } as Integration

        const p = history.push
        let logUrl = ''

        history.push = (url: string) => (logUrl = url)

        actions.onCreateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
        expect(logUrl).toMatchInlineSnapshot(
            `"/app/settings/channels/gorgias_chat/1/installation"`,
        )

        history.push = p
    })

    it('on update success', () => {
        const integration = {
            id: 1,
            type: IntegrationType.Email,
        } as Integration

        void actions.onUpdateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
    })

    describe('fetch integration', () => {
        it('success', () => {
            mockServer
                .onGet('/api/integrations/1/')
                .reply(200, { id: 1, name: 'http' })

            return store
                .dispatch(actions.fetchIntegration('1', IntegrationType.Http))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success waiting for authentication', () => {
            mockServer
                .onGet('/api/integrations/1/')
                .reply(200, { id: 1, name: 'http' })

            return store
                .dispatch(
                    actions.fetchIntegration('1', IntegrationType.Http, true),
                )
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('fails', () => {
            mockServer.onGet('/api/integrations/1/').reply(400)

            return store
                .dispatch(actions.fetchIntegration('1', IntegrationType.Http))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('delete integration', () => {
        const integration = fromJS({
            id: 1,
            type: IntegrationType.Email,
        })
        mockServer
            .onGet('/api/account/settings/?type=default-integration')
            .reply(200, {
                data: [{ type: 'default-integration', data: { email: 1 } }],
            })
        mockServer.onDelete('/api/integrations/1/').reply(200)
        return store
            .dispatch(actions.deleteIntegration(integration))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('delete integration error', () => {
        const integration = fromJS({
            id: 1,
            type: 'email',
        })

        mockServer.onDelete('/api/integrations/1/').reply(400)

        return store
            .dispatch(actions.deleteIntegration(integration))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('hideShopifyCheckoutChatBanner action', () => {
        store.dispatch(actions.hideShopifyCheckoutChatBanner())
        expect(store.getActions()).toMatchSnapshot()
    })

    describe('verifyEmailIntegration action', () => {
        it('should dispatch an EMAIL_INTEGRATION_VERIFIED action on success', () => {
            store = mockStore({
                integrations: fromJS({ integration: { id: 1 } }),
            })
            mockServer.onPost('/api/integrations/1/verify/').reply(201)

            return store
                .dispatch(actions.verifyEmailIntegration('foo'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should dispatch an EMAIL_INTEGRATION_VERIFIED action on error', () => {
            store = mockStore({
                integrations: fromJS({ integration: { id: 1 } }),
            })
            mockServer.onPost('/api/integrations/1/verify/').reply(400)

            return store
                .dispatch(actions.verifyEmailIntegration('foo'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('createGorgiasChatIntegration action', () => {
        it('should redirect to preferences page for shopify', async () => {
            const data = fromJS({
                type: 'gorgias_chat',
                meta: {
                    shop_integration_id: 1,
                },
            })
            mockServer.onPost('/api/integrations/').reply(201, {
                id: 123,
                meta: {
                    shop_integration_id: 1,
                },
            })
            mockServer.onPut('/api/integrations/123').reply(200, {
                id: 123,
                meta: {
                    shop_integration_id: 1,
                },
            })

            await store.dispatch(actions.createGorgiasChatIntegration(data))

            expect(history.push).toHaveBeenCalledWith(
                '/app/settings/channels/gorgias_chat/123/preferences',
            )
        })

        it('should redirect to installation page if automatic install failed', async () => {
            const data = fromJS({
                type: 'gorgias_chat',
                meta: {
                    shop_integration_id: 1,
                },
            })
            mockServer.onPost('/api/integrations/').reply(201, {
                id: 123,
                meta: {
                    shop_integration_id: 1,
                },
            })
            mockServer.onPut('/api/integrations/123').reply(400, {
                error: { msg: 'Something went wrong' },
            })

            await store.dispatch(actions.createGorgiasChatIntegration(data))

            expect(history.push).toHaveBeenCalledWith(
                '/app/settings/channels/gorgias_chat/123/installation',
            )
        })

        it('should not skip installation if flag is omitted', async () => {
            const data = fromJS({
                type: 'gorgias_chat',
                meta: {
                    shop_integration_id: 1,
                },
            })
            mockServer.onPost('/api/integrations/').reply(201, {
                id: 123,
                meta: {
                    shop_integration_id: 1,
                },
            })
            mockServer.onPut('/api/integrations/123').reply(400, {
                error: { msg: 'Something went wrong' },
            })

            await store.dispatch(
                actions.createGorgiasChatIntegration(data, false),
            )

            expect(mockServer.history.post.length).toBe(1)
            expect(mockServer.history.put.length).toBe(1)
        })

        it('should skip installation if flag is provided', async () => {
            const data = fromJS({
                type: 'gorgias_chat',
                meta: {
                    shop_integration_id: 1,
                },
            })
            mockServer.onPost('/api/integrations/').reply(201, {
                id: 123,
                meta: {
                    shop_integration_id: 1,
                },
            })

            await store.dispatch(
                actions.createGorgiasChatIntegration(data, false, true),
            )

            expect(mockServer.history.post.length).toBe(1)
            expect(mockServer.history.put.length).toBe(0)
        })

        it('should redirect to installation page for non-shopify', async () => {
            const data = fromJS({
                type: 'gorgias_chat',
                meta: {},
            })
            mockServer.onPost('/api/integrations/').reply(201, {
                id: 123,
                meta: {},
            })

            await store.dispatch(actions.createGorgiasChatIntegration(data))

            expect(history.push).toHaveBeenCalledWith(
                '/app/settings/channels/gorgias_chat/123/installation',
            )
        })
    })

    describe('fetchChatIntegrationStatus action', () => {
        let chatClient: Client
        const defaultApiResponse = axiosSuccessResponse({})

        beforeEach(async () => {
            chatClient = await getGorgiasChatProtectedApiClient()
            jest.resetAllMocks()
        })

        it('should set status if computed and not call `getApplicationAgents`', async () => {
            const spyGetApplicationAgents = jest
                .spyOn(chatClient, 'getApplicationAgents')
                .mockResolvedValue(defaultApiResponse)
            const spyGetInstallationStatusAction = jest
                .spyOn(gorgiasChatActions, 'getInstallationStatus')
                .mockReturnValue(Promise.resolve(neutralInstallationStatus))
            const spyComputeChatIntegrationStatus = jest
                .spyOn(helpers, 'computeChatIntegrationStatus')
                .mockImplementation(() => GorgiasChatStatusEnum.HIDDEN)

            await store.dispatch(actions.fetchChatIntegrationStatus(1))

            expect(spyGetInstallationStatusAction).toHaveBeenCalled()
            expect(spyComputeChatIntegrationStatus).toHaveBeenCalled()
            expect(spyGetApplicationAgents).not.toHaveBeenCalled()
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should set installed status if there are agents available', async () => {
            const spyGetApplicationAgents = jest
                .spyOn(chatClient, 'getApplicationAgents')
                .mockResolvedValue({
                    ...defaultApiResponse,
                    data: {
                        hasAvailableAgents: true,
                    },
                })
            const spyGetInstallationStatusAction = jest
                .spyOn(gorgiasChatActions, 'getInstallationStatus')
                .mockReturnValue(Promise.resolve(neutralInstallationStatus))
            const spyComputeChatIntegrationStatus = jest
                .spyOn(helpers, 'computeChatIntegrationStatus')
                .mockImplementation(() => GorgiasChatStatusEnum.INSTALLED)

            await store.dispatch(actions.fetchChatIntegrationStatus(1))

            expect(spyGetInstallationStatusAction).toHaveBeenCalled()
            expect(spyComputeChatIntegrationStatus).toHaveBeenCalled()
            expect(spyGetApplicationAgents).not.toHaveBeenCalled()
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should not check agent availability when status is already determined', async () => {
            const spyGetApplicationAgents = jest
                .spyOn(chatClient, 'getApplicationAgents')
                .mockResolvedValue({
                    ...defaultApiResponse,
                    data: {
                        hasAvailableAgents: false,
                    },
                })
            const spyGetInstallationStatusAction = jest
                .spyOn(gorgiasChatActions, 'getInstallationStatus')
                .mockReturnValue(Promise.resolve(neutralInstallationStatus))
            const spyComputeChatIntegrationStatus = jest
                .spyOn(helpers, 'computeChatIntegrationStatus')
                .mockImplementation(() => GorgiasChatStatusEnum.INSTALLED)

            await store.dispatch(actions.fetchChatIntegrationStatus(1))

            expect(spyGetInstallationStatusAction).toHaveBeenCalled()
            expect(spyComputeChatIntegrationStatus).toHaveBeenCalled()
            expect(spyGetApplicationAgents).not.toHaveBeenCalled()
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should not make API call when status is already determined', async () => {
            const spyGetApplicationAgents = jest
                .spyOn(chatClient, 'getApplicationAgents')
                .mockRejectedValue({
                    ...defaultApiResponse,
                    status: 400,
                })
            const spyGetInstallationStatusAction = jest
                .spyOn(gorgiasChatActions, 'getInstallationStatus')
                .mockReturnValue(Promise.resolve(neutralInstallationStatus))
            const spyComputeChatIntegrationStatus = jest
                .spyOn(helpers, 'computeChatIntegrationStatus')
                .mockImplementation(() => GorgiasChatStatusEnum.INSTALLED)

            await store.dispatch(actions.fetchChatIntegrationStatus(1))

            expect(spyGetInstallationStatusAction).toHaveBeenCalled()
            expect(spyComputeChatIntegrationStatus).toHaveBeenCalled()
            expect(spyGetApplicationAgents).not.toHaveBeenCalled()
            expect(store.getActions()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: constants.FETCH_CHAT_STATUS_SUCCESS,
                        chatStatus: GorgiasChatStatusEnum.INSTALLED,
                    }),
                ]),
            )
            expect(store.getActions()).toMatchSnapshot()
        })
        it('should handle integration type mismatch', async () => {
            const integrationId = '1'
            const integrationType = IntegrationType.Shopify
            const response = {}

            jest.spyOn(
                helpers,
                'isWellKnownEcomIntegrationIdMisMatch',
            ).mockReturnValue(true)
            jest.spyOn(history, 'replace').mockImplementation(() => {})

            mockServer
                .onGet(`/api/integrations/${integrationId}`)
                .reply(200, response)

            await store.dispatch(
                actions.fetchIntegration(integrationId, integrationType),
            )

            const actionsDispatched = store.getActions()
            expect(history.replace).toHaveBeenCalledWith(
                `/app/settings/integrations/${integrationType}`,
            )
            expect(actionsDispatched).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: constants.FETCH_INTEGRATION_ERROR,
                        error: 'integration type mismatch',
                        reason: `Integration with ID ${integrationId} is not a valid ${integrationType} integration`,
                    }),
                ]),
            )
        })
        it('on type match, dispatches integration fetch success', async () => {
            const integrationId = '1'
            const integrationType = IntegrationType.Shopify
            const response = {}

            jest.spyOn(
                helpers,
                'isWellKnownEcomIntegrationIdMisMatch',
            ).mockReturnValue(false)

            mockServer
                .onGet(`/api/integrations/${integrationId}`)
                .reply(200, response)

            await store.dispatch(
                actions.fetchIntegration(integrationId, integrationType),
            )

            const actionsDispatched = store.getActions()

            expect(actionsDispatched).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: constants.FETCH_INTEGRATION_SUCCESS,
                        integration: response,
                    }),
                ]),
            )
        })
    })
})
