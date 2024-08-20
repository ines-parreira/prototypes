import React from 'react'
import {useListLiveCallQueueAgents} from '@gorgias/api-queries'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'

import css from './LiveVoiceAgentsList.less'
import LiveVoiceAgentsList from './LiveVoiceAgentsList'

export default function LiveVoiceAgentsSection() {
    const {data: agents, isLoading} = useListLiveCallQueueAgents(undefined, {
        query: {
            staleTime: 60 * 1000, // 1 minute
        },
    })

    if (isLoading && !agents) {
        return (
            <Wrapper>
                {new Array(10).fill(null).map((_, index) => (
                    <TableBodyRow key={index}>
                        <BodyCell>
                            <Skeleton
                                width={36}
                                height={36}
                                borderRadius={100}
                            />
                        </BodyCell>
                        <BodyCell>
                            <Skeleton height={36} width={193} />
                        </BodyCell>
                    </TableBodyRow>
                ))}
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
            <NoDataAvailable title="No data available" description="" />
        </Wrapper>
    )
}

const Wrapper = ({children}: {children: React.ReactNode}) => (
    <>
        <div className={css.title}>Agents</div>
        {children}
    </>
)
