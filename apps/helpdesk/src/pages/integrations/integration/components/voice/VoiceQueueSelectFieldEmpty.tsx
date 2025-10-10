import { LegacyButton as Button } from '@gorgias/axiom'

import css from './VoiceQueueSelectField.less'

type VoiceQueueSelectProps = {
    onAddClick: () => void
}

export default function VoiceQueueSelectFieldEmpty({
    onAddClick,
}: VoiceQueueSelectProps) {
    return (
        <div className={css.noQueues}>
            <div className={css.description}>
                <div className={css.title}>No call queues yet?</div>
                <div>
                    Queues route calls to the right team for faster responses.
                    We apply default settings to get you started, which you can
                    customize anytime.
                </div>
            </div>
            <Button
                leadingIcon="add"
                fillStyle={'ghost'}
                className={css.button}
                onClick={onAddClick}
            >
                Create New Call Queue
            </Button>
        </div>
    )
}
