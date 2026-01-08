import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MigrationStage } from '../readMigration'
import { readMigration } from '../readMigration'

describe('readMigration', () => {
    const v1 = vi.fn().mockResolvedValue('old')
    const v2 = vi.fn().mockResolvedValue('new')
    const comparison = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        v1.mockResolvedValue('old')
        v2.mockResolvedValue('new')
    })

    it('Should run only the old branch by default', async () => {
        const result = await readMigration('off', v1, v2, comparison)

        expect(result).toBe('old')
    })

    it('Should run only the old branch in "off" mode', async () => {
        const result = await readMigration('off', v1, v2, comparison)

        expect(result).toBe('old')
        expect(v1).toHaveBeenCalled()
        expect(v2).not.toHaveBeenCalled()
        expect(comparison).not.toHaveBeenCalled()
    })

    it('Should run both branches but return the old result in "shadow" mode', async () => {
        const migrationMode: MigrationStage = 'shadow'

        const result = await readMigration(migrationMode, v1, v2, comparison)

        expect(result).toBe('old')
        expect(v1).toHaveBeenCalled()
        expect(v2).toHaveBeenCalled()
        expect(comparison).toHaveBeenCalledWith('old', 'new')
    })

    it('Should run both branches and return the new result in "live" mode', async () => {
        const migrationMode: MigrationStage = 'live'

        const result = await readMigration(migrationMode, v1, v2, comparison)

        expect(result).toBe('new')
        expect(v1).toHaveBeenCalled()
        expect(v2).toHaveBeenCalled()
        expect(comparison).toHaveBeenCalledWith('old', 'new')
    })

    it('Should run only the new branch in "complete" mode', async () => {
        const result = await readMigration('complete', v1, v2, comparison)

        expect(result).toBe('new')
        expect(v1).not.toHaveBeenCalled()
        expect(v2).toHaveBeenCalled()
        expect(comparison).not.toHaveBeenCalled()
    })

    it('Should not throw if the non-authoritative branch throws', async () => {
        const migrationMode: MigrationStage = 'shadow'
        v2.mockRejectedValue(Error('Something happened'))

        const result = readMigration(migrationMode, v1, v2)

        await expect(result).resolves.toBe('old')
    })

    it('Should throw if the authoritative branch throws', async () => {
        const migrationMode: MigrationStage = 'live'
        v2.mockRejectedValue(Error('Something happened'))

        const result = readMigration(migrationMode, v1, v2)

        await expect(result).rejects.toThrow('Something happened')
    })
})
