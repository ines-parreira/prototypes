import client from 'models/api/resources'
import type { ApiListResponseCursorPagination } from 'models/api/types'

import type { Channel } from './types'

export async function listChannels(): Promise<
    ApiListResponseCursorPagination<Channel[]>
> {
    const response =
        await client.get<ApiListResponseCursorPagination<Channel[]>>(
            '/channels',
        )
    return response.data
}
