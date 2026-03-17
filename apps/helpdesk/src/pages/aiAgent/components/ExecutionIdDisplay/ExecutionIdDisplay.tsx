import { useShouldDisplayExecutionId } from 'pages/aiAgent/hooks/useShouldDisplayExecutionId'

import css from './ExecutionIdDisplay.less'

interface ExecutionIdDisplayProps {
    executionId: string | undefined
}

export const ExecutionIdDisplay = ({
    executionId,
}: ExecutionIdDisplayProps) => {
    const shouldDisplay = useShouldDisplayExecutionId()

    if (!shouldDisplay || !executionId) {
        return null
    }

    return (
        <div className={css.container}>
            <span>Execution ID: {executionId}</span>
        </div>
    )
}
