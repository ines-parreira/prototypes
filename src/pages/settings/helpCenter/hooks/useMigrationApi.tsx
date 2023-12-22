import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react'
import {MigrationClient, getMigrationClient} from 'rest_api/migration_api'

interface UseMigrationApiContextValue {
    client: MigrationClient | null
}

const MigrationApiClientContext = createContext<UseMigrationApiContextValue>({
    client: null,
})

interface MigrationApiClientProviderProps {
    children: ReactNode
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
    const {client} = useContext(MigrationApiClientContext)
    return client
}
