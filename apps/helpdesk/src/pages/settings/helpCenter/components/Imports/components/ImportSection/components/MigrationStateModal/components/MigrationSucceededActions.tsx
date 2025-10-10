import { Progress } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { SucceededMigrationState } from '../../../types'

type Props = {
    state: SucceededMigrationState
    progressClassName: string
    progressLabelClassName: string
}

const MigrationSucceededActions: React.FC<Props> = ({
    state,
    progressClassName,
    progressLabelClassName,
}) => {
    return (
        <>
            <div className={progressLabelClassName}>100% Complete</div>
            <div className="mb-1"></div>
            <Progress className={progressClassName} value={100} />
            <div className="mb-4"></div>
            <Button className="w-100" onClick={state.onFinish}>
                Finish
            </Button>
        </>
    )
}

export default MigrationSucceededActions
