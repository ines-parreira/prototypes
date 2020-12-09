import client from '../api/resources'
import {AccountSetting} from '../../state/currentAccount/types'

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
