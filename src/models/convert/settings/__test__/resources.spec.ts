import {channelConnectionId} from 'fixtures/channelConnection'
import {RevenueAddonClient} from 'rest_api/revenue_addon_api/client'

import * as resources from '../resources'

jest.mock('rest_api/revenue_addon_api/client')

describe('Convert settings resources', () => {
    describe('getSettingsList', () => {
        it('should resolve with filtered settings on success', async () => {
            const expectedResponse = [
                {type: 'performance_report_visible_fields', data: {foo: 'bar'}},
            ]
            const client = {
                get_settings: jest.fn().mockReturnValue(expectedResponse),
            } as unknown as RevenueAddonClient

            const res = await resources.getSettingsList(client, {
                channel_connection_id: 'channel_id',
            })
            expect(res).toEqual(expectedResponse)
        })
    })

    describe('updateSettings', () => {
        it('should resolve with the update settingon success', async () => {
            const client = {
                update_setting: jest.fn().mockReturnValue({
                    type: 'performance_report_visible_fields',
                    data: {foo: 'bar', bar: '1'},
                }),
            } as unknown as RevenueAddonClient

            const res = await resources.updateSettings(
                client,
                {
                    channel_connection_id: channelConnectionId,
                },
                {
                    type: 'performance_report_visible_fields',
                    data: {foo: 'bar', bar: '1'},
                }
            )
            expect(res).toEqual({
                type: 'performance_report_visible_fields',
                data: {foo: 'bar', bar: '1'},
            })
        })
    })
})
