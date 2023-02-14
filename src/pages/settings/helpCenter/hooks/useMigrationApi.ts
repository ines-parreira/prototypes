import {useEffect} from 'react'
import {createGlobalState} from 'react-use'

import {getMigrationClient, MigrationClient} from 'rest_api/migration_api'

interface MigrationClientState {
    // Had to wrap it in an object because the set state function accepts callbacks, and as we know the axios instance is a function too
    current: MigrationClient | null
}

// Creating the state globally so we don't have to worry about wrapping in context providers
const useMigrationClientState = createGlobalState<MigrationClientState>({
    current: null,
})

export const useMigrationApi = () => {
    const [state, setState] = useMigrationClientState()

    useEffect(() => {
        async function init() {
            const client = await getMigrationClient()
            setState({current: client})
        }
        if (!state.current) {
            void init()
        }
    }, [setState, state])

    return state.current
}
