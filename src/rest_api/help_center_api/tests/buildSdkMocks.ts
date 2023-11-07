import MockAdapter from 'axios-mock-adapter'

import {HelpCenterClient, helpCenterAPI} from '../client'

/**
 * This is a helper function to build the Help Center Client SDK mocks.
 * Use the mockedServer to mock the API responses.
 * Use the client to call the SDK methods in your tests.
 */
export const buildSDKMocks = async () => {
    const client = await helpCenterAPI.getClient<HelpCenterClient>()
    // for the tests, we don't need the ability since we mock the server answers
    client.ability = undefined
    return {mockedServer: new MockAdapter(client), client}
}
