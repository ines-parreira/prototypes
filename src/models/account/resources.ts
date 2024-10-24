import {AccountSetting} from '../../state/currentAccount/types'
import client from '../api/resources'

export const createAccountSetting = async (
    data: Omit<AccountSetting, 'id'>
) => {
    return await client.post<AccountSetting>('/api/account/settings/', data)
}

export const updateAccountSetting = async (data: AccountSetting) => {
    const res = await client.put<AccountSetting>(
        `/api/account/settings/${data.id}/`,
        data
    )
    return res
}

export const getAccountSettings = async (type?: string | null) => {
    const res = await client.get<{data: AccountSetting[]}>(
        '/api/account/settings/',
        {params: {type}}
    )
    return res.data.data
}
