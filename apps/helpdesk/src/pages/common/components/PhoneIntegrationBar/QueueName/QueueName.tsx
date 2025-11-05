import classnames from 'classnames'

import { Icon } from '@gorgias/axiom'
import { useGetVoiceQueue } from '@gorgias/helpdesk-queries'

import css from './QueueName.less'

type Props = {
    queueId: number | null
    primary?: boolean
}

function QueueName({ queueId, primary }: Props) {
    const {
        data: queue,
        isFetching,
        isError,
    } = useGetVoiceQueue(
        queueId ?? 0,
        {},
        {
            query: {
                refetchOnWindowFocus: false,
                enabled: !!queueId,
                select: (data) => data.data,
            },
        },
    )

    if (!queueId || isFetching || isError || !queue) {
        return null
    }

    return (
        <span className={classnames(css.container, { [css.primary]: primary })}>
            <Icon name={'users'} />

            {queue.name || `Queue #${queue.id}`}
        </span>
    )
}

export default QueueName
