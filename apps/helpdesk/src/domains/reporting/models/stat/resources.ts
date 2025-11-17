import type { AxiosRequestConfig } from 'axios'

import type {
    LegacyStatsFilters,
    Stat,
} from 'domains/reporting/models/stat/types'
import client from 'models/api/resources'

export async function fetchStat(
    name: string,
    data: { filters: LegacyStatsFilters; cursor?: string },
    { timeout = 180000, ...config }: AxiosRequestConfig = {},
) {
    const resp = await client.post<Stat>(`/api/stats/${name}/`, data, {
        timeout,
        ...config,
    })

    return resp.data
}

export async function downloadStat(
    name: string,
    filters: { filters: LegacyStatsFilters },
    { timeout = 180000, ...config }: AxiosRequestConfig = {},
) {
    const resp = await client.post<
        string,
        { headers: { 'content-disposition'?: string }; data: string }
    >(`/api/stats/${name}/download`, filters, { timeout, ...config })
    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    const matches = (resp.headers['content-disposition'] || '').match(
        /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/,
    )
    const filename = matches?.length ? matches.pop()! : `${name}.csv`

    return {
        name: filename,
        contentType: resp.headers['content-disposition'],
        data: resp.data,
    }
}
