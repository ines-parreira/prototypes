import { Progress } from 'reactstrap'

import Button from 'pages/common/components/button/Button'

import { InProgressMigrationState } from '../../../types'

type Props = {
    state: InProgressMigrationState
    progressClassName: string
    progressLabelClassName: string
}

const MigrationInProgressActions: React.FC<Props> = ({
    state,
    progressClassName,
    progressLabelClassName,
}) => {
    return (
        <>
            <div className={progressLabelClassName}>
                {state.progress.toFixed(0)}% Complete
            </div>
            <div className="mb-1"></div>
            <Progress
                className={progressClassName}
                value={state.progress}
                animated
            />
            <div className="mb-4"></div>
            <Button className="w-100" isDisabled isLoading>
                Loading
            </Button>
        </>
    )
}

export default MigrationInProgressActions
