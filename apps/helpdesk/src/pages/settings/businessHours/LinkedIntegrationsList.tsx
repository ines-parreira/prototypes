import { useEffect, useMemo } from 'react'

import _flatten from 'lodash/flatten'

import { Box, Label } from '@gorgias/axiom'

import useInfiniteListBusinessHoursIntegrations from 'hooks/businessHours/useInfiniteListBusinessHoursIntegrations'
import { useNotify } from 'hooks/useNotify'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import SourceIcon from 'pages/common/components/SourceIcon'

import css from './LinkedIntegrationsList.less'

type Props = {
    businessHoursId: number
}

export default function LinkedIntegrationsList({ businessHoursId }: Props) {
    const { data, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteListBusinessHoursIntegrations(businessHoursId, undefined, {
            staleTime: 15_000,
        })
    const notify = useNotify()

    const integrations = useMemo(
        () => _flatten(data?.pages.map((page) => page.data.data)),
        [data],
    )

    useEffect(() => {
        if (isError) {
            notify.error('There was an error while fetching integrations')
        }
    }, [isError, notify])

    return (
        <Box gap="xs" flexDirection="column" className={css.container}>
            <Label>Integrations</Label>
            <InfiniteScroll
                onLoad={fetchNextPage}
                shouldLoadMore={hasNextPage}
                isLoading={isFetchingNextPage}
            >
                {integrations.map((integration) => (
                    <Box
                        key={integration.integration_id}
                        gap="xs"
                        alignItems="center"
                    >
                        <SourceIcon
                            type={integration.integration_type}
                            className={css.sourceIcon}
                        />
                        <div>{integration.integration_name}</div>
                    </Box>
                ))}
            </InfiniteScroll>
        </Box>
    )
}
