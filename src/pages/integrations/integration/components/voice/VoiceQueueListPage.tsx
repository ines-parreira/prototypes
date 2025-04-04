import { ReactNode } from 'react'

import { VoiceQueue } from '@gorgias/api-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import { useInfiniteListVoiceQueues } from 'hooks/reporting/common/useInfiniteListVoiceQueues'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import VoiceQueueList from './VoiceQueueList'

export default function VoiceQueueListPage() {
    const {
        data,
        isFetching,
        isFetchingNextPage,
        isFetchedAfterMount,
        refetch,
        hasNextPage,
        fetchNextPage,
        isError,
    } = useInfiniteListVoiceQueues()

    const queues =
        data?.pages?.reduce(
            (acc, page) => [...acc, ...(page.data?.data || [])],
            [] as VoiceQueue[],
        ) ?? []

    const handleLoadMore = async () => {
        if (hasNextPage && !isFetching && !isFetchingNextPage) {
            await fetchNextPage()
        }
    }

    if (isError) {
        return (
            <Wrapper>
                <p>
                    There was an error while trying to fetch the queues. Please
                    try again later.
                </p>
                <Button onClick={() => refetch()} isLoading={isFetching}>
                    Retry
                </Button>
            </Wrapper>
        )
    }

    if (isFetchedAfterMount && queues.length === 0) {
        return (
            <Wrapper>
                <p>You have no queues at the moment.</p>
                <Button
                    as="a"
                    href={`${PHONE_INTEGRATION_BASE_URL}/queues/new`}
                >
                    Create queue
                </Button>
            </Wrapper>
        )
    }

    return (
        <div>
            <VoiceQueueList queues={queues} onScroll={handleLoadMore} />
        </div>
    )
}

const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
        <SettingsPageContainer>
            <SettingsContent>{children}</SettingsContent>
        </SettingsPageContainer>
    )
}
