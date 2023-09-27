import {Query, QueryKey} from '@tanstack/react-query'

export const queryCacheConfigWithoutRedux = {
    onSuccess: (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        data: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        query: Query<unknown, unknown, unknown, QueryKey>
    ) => {
        // coming in the next PR
    },
}
