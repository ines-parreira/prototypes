import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'

import { getMigrationClient, MigrationClient } from 'rest_api/migration_api'

interface UseMigrationApiContextValue {
    client: MigrationClient | null
}

const MigrationApiClientContext = createContext<UseMigrationApiContextValue>({
    client: null,
})

interface MigrationApiClientProviderProps {
    children?: ReactNode
}

export const MigrationApiClientProvider = ({
    children,
}: MigrationApiClientProviderProps) => {
    const [value, setValue] = useState<UseMigrationApiContextValue>({
        client: null,
    })

    useEffect(() => {
        void (async () => {
            setValue({
                client: await getMigrationClient(),
            })
        })()
    }, [])

    return (
        <MigrationApiClientContext.Provider value={value}>
            {children}
        </MigrationApiClientContext.Provider>
    )
}

export const useMigrationApi = () => {
    const { client } = useContext(MigrationApiClientContext)
    return client
}
