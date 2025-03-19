import Button from 'pages/common/components/button/Button'

import { ConnectedMigrationState } from '../../../types'

type Props = {
    state: ConnectedMigrationState
}

const MigrationConnectedActions: React.FC<Props> = ({ state }) => {
    return (
        <Button
            className="w-100"
            onClick={state.onMigrationStart}
            isLoading={state.isMigrationStartLoading}
        >
            Start migrating
        </Button>
    )
}

export default MigrationConnectedActions
