import {renderHook} from '@testing-library/react-hooks'
import {getMigrationClient} from 'rest_api/migration_api'
import {useMigrationApi, MigrationApiClientProvider} from '../useMigrationApi'

describe('useMigrationApi', () => {
    it('should return the migration client', async () => {
        const {result, waitForNextUpdate} = renderHook(
            () => useMigrationApi(),
            {
                wrapper: MigrationApiClientProvider,
            }
        )
        await waitForNextUpdate()

        expect(result.current).not.toBeNull()
        expect(result.current).toBe(await getMigrationClient())
    })
})
