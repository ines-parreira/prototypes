import { LegacyButton as Button, Skeleton } from '@gorgias/axiom'
import { useListLiveCallQueueAgents } from '@gorgias/helpdesk-queries'
import type { ListLiveCallQueueAgentsParams } from '@gorgias/helpdesk-types'

import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import LiveVoiceAgentsList from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsList'
import css from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsList.less'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'

type Props = {
    params: ListLiveCallQueueAgentsParams
}

export default function LiveVoiceAgentsSection({ params }: Props) {
    const {
        data: agents,
        isLoading,
        refetch,
    } = useListLiveCallQueueAgents(params, {
        http: {
            paramsSerializer: {
                indexes: null,
            },
        },
        query: {
            refetchOnWindowFocus: false,
        },
    })

    if (isLoading && !agents) {
        return (
            <Wrapper>
                <TableWrapper>
                    <TableBody>
                        {Array.from({ length: 10 }, (_, index) => (
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

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <>
        <div className={css.title}>Agents</div>
        {children}
    </>
)
