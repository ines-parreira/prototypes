import { useEffect, useMemo } from 'react'
import { Duration } from '@gorgias/toolkit'

import _flatten from 'lodash/flatten'

import { Box, LegacyLabel as Label, toast } from '@gorgias/axiom'

import { useInfiniteListBusinessHoursIntegrations } from 'hooks/businessHours/useInfiniteListBusinessHoursIntegrations'
import { InfiniteScroll } from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import { DefaultExportSourceIcon as SourceIcon } from 'pages/common/components/SourceIcon'

import css from './LinkedIntegrationsList.less'

type Props = {
    businessHoursId: number
}

export function LinkedIntegrationsList({ businessHoursId }: Props) {
    const { data, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteListBusinessHoursIntegrations(businessHoursId, undefined, {
            staleTime: Duration.seconds(15),
        })

    const integrations = useMemo(
        () => _flatten(data?.pages.map((page) => page.data.data)),
        [data],
    )

    useEffect(() => {
        if (isError) {
            toast.error('There was an error while fetching integrations')
        }
    }, [isError])

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
