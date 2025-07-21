import { waitFor } from '@testing-library/react'

import { getMigrationClient } from 'rest_api/migration_api'
import { renderHook } from 'utils/testing/renderHook'

import { MigrationApiClientProvider, useMigrationApi } from '../useMigrationApi'

describe('useMigrationApi', () => {
    it('should return the migration client', async () => {
        const { result } = renderHook(() => useMigrationApi(), {
            wrapper: MigrationApiClientProvider,
        })
        await waitFor(() => {
            expect(result.current).not.toBeNull()
        })

        expect(result.current).toBe(await getMigrationClient())
    })
})
