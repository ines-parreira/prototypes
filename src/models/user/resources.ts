import {UserSetting} from '../../config/types/user'
import client from '../api/resources'

export const createUserSetting = async (data: Omit<UserSetting, 'id'>) => {
    const res = await client.post<UserSetting>('/api/users/0/settings/', data)
    return res
}

export const updateUserSetting = async (data: UserSetting) => {
    const res = await client.put<UserSetting>(
        `/api/users/0/settings/${data.id}/`,
        data
    )
    return res
}
