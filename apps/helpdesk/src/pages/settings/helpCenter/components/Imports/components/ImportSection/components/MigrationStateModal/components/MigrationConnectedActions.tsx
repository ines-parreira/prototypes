import { LegacyButton as Button } from '@gorgias/axiom'

import type { ConnectedMigrationState } from '../../../types'

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
