import MockAdapter from 'axios-mock-adapter'
import _omit from 'lodash/omit'

import client from '../../api/resources'
import {
    AccountSetting,
    AccountSettingType,
} from '../../../state/currentAccount/types'
import {createAccountSetting, updateAccountSetting} from '../resources'

const mockedServer = new MockAdapter(client)

describe('account resources', () => {
    const mockedData: AccountSetting = {
        data: {
            views: {
                1: {display_order: 0},
            },
            view_sections: {1: {display_order: 1}},
        },
        id: 2,
        type: AccountSettingType.ViewsOrdering,
    }

    beforeEach(() => {
        mockedServer.reset()
    })

    describe('createAccountSetting', () => {
        it('should resolve on success', async () => {
            mockedServer.onPost('/api/account/settings/').reply(200, mockedData)

            const res = await createAccountSetting(_omit(mockedData, 'id'))
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPost('/api/account/settings/')
                .reply(503, {message: 'error'})
            return expect(
                createAccountSetting(_omit(mockedData, 'id'))
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('updateAccountSetting', () => {
        it('should resolve on success', async () => {
            mockedServer
                .onPut('/api/account/settings/2/')
                .reply(200, mockedData)

            const res = await updateAccountSetting(mockedData)
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut('/api/account/settings/2/')
                .reply(503, {message: 'error'})
            return expect(updateAccountSetting(mockedData)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
