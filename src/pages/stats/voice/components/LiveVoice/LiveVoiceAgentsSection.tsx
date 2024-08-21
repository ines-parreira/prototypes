import React from 'react'
import {useListLiveCallQueueAgents} from '@gorgias/api-queries'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import Button from 'pages/common/components/button/Button'

import css from './LiveVoiceAgentsList.less'
import LiveVoiceAgentsList from './LiveVoiceAgentsList'

export default function LiveVoiceAgentsSection() {
    const {
        data: agents,
        isLoading,
        refetch,
    } = useListLiveCallQueueAgents(undefined, {
        query: {
            staleTime: Infinity,
            refetchOnMount: 'always',
            refetchOnWindowFocus: false,
        },
    })

    if (isLoading && !agents) {
        return (
            <Wrapper>
                <TableWrapper>
                    <TableBody>
                        {new Array(10).fill(null).map((_, index) => (
                            <TableBodyRow key={index}>
                                <BodyCell innerClassName={css.avatarSkeleton}>
                                    <Skeleton
                                        width={36}
                                        height={36}
                                        borderRadius={100}
                                    />
                                </BodyCell>
                                <BodyCell innerClassName={css.nameSkeleton}>
                                    <Skeleton height={23} width={193} />
                                </BodyCell>
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </TableWrapper>
            </Wrapper>
        )
    }

    if (agents?.data?.data?.length) {
        return (
            <Wrapper>
                <LiveVoiceAgentsList agents={agents.data?.data} />
            </Wrapper>
        )
    }

    return (
        <Wrapper>
            <div className={css.noDataWrapper}>
                <NoDataAvailable
                    title="No data available"
                    description="Unable to load agent status"
                />
                <Button fillStyle="ghost" onClick={() => refetch()}>
                    Try again
                </Button>
            </div>
        </Wrapper>
    )
}

const Wrapper = ({children}: {children: React.ReactNode}) => (
    <>
        <div className={css.title}>Agents</div>
        {children}
    </>
)
