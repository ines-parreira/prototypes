import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classnames from 'classnames'

import { Icon, Tag } from '@gorgias/axiom'
import { useGetVoiceQueue } from '@gorgias/helpdesk-queries'

import css from './QueueName.less'

type Props = {
    queueId: number | null
    primary?: boolean
}

function QueueName({ queueId, primary }: Props) {
    const applyCallBarRestyling = useFlag(FeatureFlagKey.CallBarRestyling)

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

    if (!applyCallBarRestyling) {
        return (
            <span
                className={classnames(css.container, {
                    [css.primary]: primary,
                })}
            >
                <Icon name={'users'} />

                {queue.name || `Queue #${queue.id}`}
            </span>
        )
    }

    return (
        <Tag
            leadingSlot={<Icon name={'users'} />}
            {...(primary ? { color: 'green' } : {})}
        >
            {queue.name || `Queue #${queue.id}`}
        </Tag>
    )
}

export default QueueName
