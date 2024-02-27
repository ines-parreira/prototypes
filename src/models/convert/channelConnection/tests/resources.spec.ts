import {RevenueAddonClient} from 'rest_api/revenue_addon_api/client'
import {
    channelConnection,
    channelConnectionId,
} from 'fixtures/channelConnection'
import * as resources from '../resources'

jest.mock('rest_api/revenue_addon_api/client')

describe('Channel Connection resources', () => {
    describe('getChannelConnection', () => {
        it('should resolve with a Channel connection on success', async () => {
            const client = {
                get_channel_connection: jest
                    .fn()
                    .mockReturnValue(channelConnection),
            } as unknown as RevenueAddonClient

            const res = await resources.getChannelConnection(client, {
                channel_connection_id: channelConnectionId,
            })
            expect(res).toEqual(channelConnection)
        })
    })

    describe('listChannelConnections', () => {
        it('should resolve with filtered Channel connections on success', async () => {
            const client = {
                get_channel_connections: jest
                    .fn()
                    .mockReturnValue([channelConnection]),
            } as unknown as RevenueAddonClient

            const res = await resources.listChannelConnections(client, {
                channel: 'widget',
                storeIntegrationId: 1,
                externalId: '123',
            })
            expect(res).toEqual([channelConnection])
        })
    })

    describe('createChannelConnection', () => {
        it('should resolve with the created Channel connection on success', async () => {
            const client = {
                create_channel_connection: jest
                    .fn()
                    .mockReturnValue(channelConnection),
            } as unknown as RevenueAddonClient

            const res = await resources.createChannelConnection(client, {
                channel: 'widget',
                store_integration_id: channelConnection.store_integration_id,
                external_id: channelConnection.external_id,
                external_installation_status:
                    channelConnection.external_installation_status,
            })
            expect(res).toEqual(channelConnection)
        })
    })

    describe('updateChannelConnection', () => {
        it('should resolve with the updated Channel connection on success', async () => {
            const externalId = 'xyz'
            const client = {
                patch_channel_connection: jest.fn().mockReturnValue({
                    ...channelConnection,
                    external_id: externalId,
                }),
            } as unknown as RevenueAddonClient

            const res = await resources.updateChannelConnection(
                client,
                {
                    channel_connection_id: channelConnectionId,
                },
                {
                    external_id: externalId,
                }
            )
            expect(res).toEqual({...channelConnection, external_id: externalId})
        })
    })

    describe('deleteChannelConnection', () => {
        it('should resolve with the deleted Channel connection on success', async () => {
            const client = {
                delete_channel_connection: jest.fn(),
            } as unknown as RevenueAddonClient

            const res = await resources.deleteChannelConnection(client, {
                channel_connection_id: channelConnectionId,
            })
            expect(res).toEqual(undefined)
        })
    })
})
