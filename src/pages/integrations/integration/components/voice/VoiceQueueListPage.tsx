import { ReactNode, useState } from 'react'

import {
    ListVoiceQueuesOrderBy,
    useListVoiceQueues,
} from '@gorgias/api-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import { NumberedPagination } from 'pages/common/components/Paginations/NumberedPagination'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import { PHONE_INTEGRATION_BASE_URL, QUEUE_LIST_PAGE_SIZE } from './constants'
import VoiceQueueList from './VoiceQueueList'

export default function VoiceQueueListPage() {
    const [currentPage, setCurrentPage] = useState(1)
    const [cursor, setCursor] = useState<string | undefined>()
    const { data, isError, isFetching, refetch } = useListVoiceQueues(
        {
            order_by: ListVoiceQueuesOrderBy.CreatedDatetimeDesc,
            cursor,
            limit: QUEUE_LIST_PAGE_SIZE,
        },
        {
            query: {
                keepPreviousData: true,
            },
        },
    )

    const totalResources = data?.data?.meta?.total_resources

    const handlePageChange = (page: number) => {
        if (page < currentPage) {
            setCursor(data?.data?.meta?.prev_cursor ?? undefined)
        } else {
            setCursor(data?.data?.meta?.next_cursor ?? undefined)
        }
        setCurrentPage(page)
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

    if (data?.data?.data.length === 0) {
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
            <VoiceQueueList queues={data?.data?.data} isFetching={isFetching} />
            <NumberedPagination
                onChange={handlePageChange}
                count={
                    totalResources
                        ? Math.ceil(totalResources / QUEUE_LIST_PAGE_SIZE)
                        : 0
                }
                page={currentPage}
                hideOnSinglePage
            />
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
