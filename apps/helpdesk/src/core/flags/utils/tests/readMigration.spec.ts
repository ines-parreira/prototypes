import { ldClientMock } from 'jest-launchdarkly-mock'

import { MigrationStage, readMigration } from 'core/flags/utils/readMigration'
import { getLDClient } from 'utils/launchDarkly'

jest.mock('utils/launchDarkly', () => ({
    getLDClient: jest.fn(),
}))
const getLDClientMock = getLDClient as jest.Mock
getLDClientMock.mockReturnValue(ldClientMock)

describe('readMigration', () => {
    const v1 = jest.fn().mockResolvedValue('old')
    const v2 = jest.fn().mockResolvedValue('new')
    const comparison = jest.fn()

    afterEach(ldClientMock.variation.mockReset)

    it('Should run only the old branch by default', async () => {
        const result = await readMigration('off', v1, v2, comparison)

        expect(result).toBe('old')
    })

    it('Should run only the old branch in "off" mode', async () => {
        ldClientMock.variation.mockReturnValue('off')

        const result = await readMigration('off', v1, v2, comparison)

        expect(result).toBe('old')
        expect(v1).toHaveBeenCalled()
        expect(v2).not.toHaveBeenCalled()
        expect(comparison).not.toHaveBeenCalled()
    })

    it('Should run both branches but return the old result in "shadow" mode', async () => {
        const migrationMode: MigrationStage = 'shadow'
        ldClientMock.variation.mockReturnValue(migrationMode)

        const result = await readMigration(migrationMode, v1, v2, comparison)

        expect(result).toBe('old')
        expect(v1).toHaveBeenCalled()
        expect(v2).toHaveBeenCalled()
        expect(comparison).toHaveBeenCalledWith('old', 'new')
    })

    it('Should run both branches and return the new result in "live" mode', async () => {
        const migrationMode: MigrationStage = 'live'
        ldClientMock.variation.mockReturnValue(migrationMode)

        const result = await readMigration(migrationMode, v1, v2, comparison)

        expect(result).toBe('new')
        expect(v1).toHaveBeenCalled()
        expect(v2).toHaveBeenCalled()
        expect(comparison).toHaveBeenCalledWith('old', 'new')
    })

    it('Should run only the new branch in "complete" mode', async () => {
        ldClientMock.variation.mockReturnValue('complete')

        const result = await readMigration('complete', v1, v2, comparison)

        expect(result).toBe('new')
        expect(v1).not.toHaveBeenCalled()
        expect(v2).toHaveBeenCalled()
        expect(comparison).not.toHaveBeenCalled()
    })

    it('Should not throw if the non-authoritative branch throws', async () => {
        const migrationMode: MigrationStage = 'shadow'
        v2.mockRejectedValue(Error('Something happened'))
        ldClientMock.variation.mockReturnValue(migrationMode)

        const result = readMigration(migrationMode, v1, v2)

        expect(result).resolves.toBe('old')
    })

    it('Should throw if the authoritative branch throws', async () => {
        const migrationMode: MigrationStage = 'live'
        v2.mockRejectedValue(Error('Something happened'))
        ldClientMock.variation.mockReturnValue(migrationMode)

        const result = readMigration(migrationMode, v1, v2)

        expect(result).rejects.toThrow('Something happened')
    })
})
