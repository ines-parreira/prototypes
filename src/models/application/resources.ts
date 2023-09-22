import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {Application} from './types'

export async function listApplications(): Promise<
    ApiListResponseCursorPagination<Application[]>
> {
    const response = await client.get<
        ApiListResponseCursorPagination<Application[]>
    >('/api/applications')
    return response.data
}
