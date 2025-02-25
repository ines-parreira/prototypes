import { appQueryClient } from 'api/queryClient'
import { ApiListResponseCursorPagination } from 'models/api/types'
import {
    applicationsQueryKeys,
    useListApplications,
} from 'models/application/queries'
import { listApplications } from 'models/application/resources'
import {
    Application,
    ApplicationMessagingConfig,
} from 'models/application/types'
import { Integration, isAppIntegration } from 'models/integration/types'
import { ChannelLike, toChannel } from 'services/channels'

export type {
    Application,
    ApplicationMessagingConfig,
    ApplicationAttachmentsMessagingConfig,
} from 'models/application/types'

const STALE_TIME = 1 * 60 * 60 * 1000
const CACHE_TIME = STALE_TIME + 60 * 1000

const INITIAL_DATA = window?.GORGIAS_STATE?.applications ?? []

export const useApplications: () => Application[] = () => {
    return (
        useListApplications({
            staleTime: STALE_TIME,
            cacheTime: CACHE_TIME,
            initialData: mockPaginatedApplicationsList(INITIAL_DATA),
        })?.data?.data ?? []
    )
}

export function getApplications(): Application[] {
    const queryData = appQueryClient.getQueryData<
        Awaited<ReturnType<typeof listApplications>>
    >(applicationsQueryKeys.list())

    return queryData?.data ?? INITIAL_DATA
}

export function getApplicationById(id: string): Application | undefined {
    return getApplications().find((application) => application.id === id)
}

export function getApplicationsByChannel(
    channelLike: ChannelLike,
): Application[] {
    const channel = toChannel(channelLike)
    return getApplications().filter(
        (application) => application.channel_id === channel?.id,
    )
}

export function hasApplicationForChannel(channelLike: ChannelLike): boolean {
    return getApplicationsByChannel(channelLike).length > 0
}

export function getMessagingConfig(
    integration: Integration,
): ApplicationMessagingConfig | undefined {
    if (!isAppIntegration(integration)) {
        return
    }

    return getApplicationById(integration.application_id)?.messaging_config
}

function mockPaginatedApplicationsList(
    entries: Application[],
): ApiListResponseCursorPagination<Application[]> {
    return {
        meta: {
            next_cursor: null,
            prev_cursor: null,
            total_resources: null,
        },
        object: 'list',
        uri: '/api/applications',
        data: entries,
    }
}
