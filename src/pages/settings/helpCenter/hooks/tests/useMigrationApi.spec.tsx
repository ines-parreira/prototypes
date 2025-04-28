import { getMigrationClient } from 'rest_api/migration_api'
import { renderHook } from 'utils/testing/renderHook'

import { MigrationApiClientProvider, useMigrationApi } from '../useMigrationApi'

describe('useMigrationApi', () => {
    it('should return the migration client', async () => {
        const { result, waitForNextUpdate } = renderHook(
            () => useMigrationApi(),
            {
                wrapper: MigrationApiClientProvider,
            },
        )
        await waitForNextUpdate()

        expect(result.current).not.toBeNull()
        expect(result.current).toBe(await getMigrationClient())
    })
})
