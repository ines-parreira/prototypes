import MockAdapter from 'axios-mock-adapter'
import _omit from 'lodash/omit'

import client from '../../api/index.js'
import {UserSettingType, UserSetting} from '../../../config/types/user'
import {createUserSetting, updateUserSetting} from '../resources'

const mockedServer = new MockAdapter(client)

describe('user resources', () => {
    const mockedData: UserSetting = {
        data: {
            1: {
                display_order: 1,
                hide: false,
            },
        },
        id: 2,
        type: UserSettingType.TicketViews,
    }

    beforeEach(() => {
        mockedServer.reset()
    })

    describe('createUserSetting', () => {
        it('should resolve on success', async () => {
            mockedServer.onPost('/api/users/0/settings/').reply(200, mockedData)

            const res = await createUserSetting(_omit(mockedData, 'id'))
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPost('/api/users/0/settings/')
                .reply(503, {message: 'error'})
            return expect(
                createUserSetting(_omit(mockedData, 'id'))
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('updateUserSetting', () => {
        it('should resolve on success', async () => {
            mockedServer
                .onPut('/api/users/0/settings/2/')
                .reply(200, mockedData)

            const res = await updateUserSetting(mockedData)
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut('/api/users/0/settings/2/')
                .reply(503, {message: 'error'})
            return expect(updateUserSetting(mockedData)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
