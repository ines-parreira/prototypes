import { FeatureFlagKey } from '@repo/feature-flags'
import { ldClientMock } from 'jest-launchdarkly-mock'

import { getLDClient } from 'utils/launchDarkly'

import readMigration, { getMigrationStage } from '../readMigration'

jest.mock('utils/launchDarkly', () => ({
    getLDClient: jest.fn(),
}))
const getLDClientMock = getLDClient as jest.Mock
getLDClientMock.mockReturnValue(ldClientMock)

const testFlag = 'test-flag' as FeatureFlagKey

describe('getMigrationStage', () => {
    afterEach(ldClientMock.variation.mockReset)

    it('Should return OFF by default', async () => {
        const result = await getMigrationStage(testFlag)
        expect(result).toBe('off')
    })

    it('Should return the custom default value', async () => {
        const result = await getMigrationStage(testFlag, 'complete')
        expect(result).toBe('complete')
    })

    it('Should return the value from LaunchDarkly if set', async () => {
        ldClientMock.variation.mockReturnValue('shadow')

        const result = await getMigrationStage(testFlag)
        expect(result).toBe('shadow')
    })
})

describe('readMigration', () => {
    const v1 = jest.fn().mockResolvedValue('old')
    const v2 = jest.fn().mockResolvedValue('new')
    const comparison = jest.fn()

    afterEach(ldClientMock.variation.mockReset)

    it('Should run only the old branch by default', async () => {
        const result = await readMigration(testFlag, v1, v2, comparison)

        expect(result).toBe('old')
    })

    it('Should run the provided mode if the default value is overriden', async () => {
        const result = await readMigration(
            testFlag,
            v1,
            v2,
            comparison,
            'complete',
        )

        expect(result).toBe('new')
    })

    it('Should run only the old branch in "off" mode', async () => {
        ldClientMock.variation.mockReturnValue('off')

        const result = await readMigration(testFlag, v1, v2, comparison)

        expect(result).toBe('old')
        expect(v1).toHaveBeenCalled()
        expect(v2).not.toHaveBeenCalled()
        expect(comparison).not.toHaveBeenCalled()
    })

    it('Should run both branches but return the old result in "shadow" mode', async () => {
        ldClientMock.variation.mockReturnValue('shadow')

        const result = await readMigration(testFlag, v1, v2, comparison)

        expect(result).toBe('old')
        expect(v1).toHaveBeenCalled()
        expect(v2).toHaveBeenCalled()
        expect(comparison).toHaveBeenCalledWith('old', 'new')
    })

    it('Should run both branches and return the new result in "live" mode', async () => {
        ldClientMock.variation.mockReturnValue('live')

        const result = await readMigration(testFlag, v1, v2, comparison)

        expect(result).toBe('new')
        expect(v1).toHaveBeenCalled()
        expect(v2).toHaveBeenCalled()
        expect(comparison).toHaveBeenCalledWith('old', 'new')
    })

    it('Should run only the new branch in "complete" mode', async () => {
        ldClientMock.variation.mockReturnValue('complete')

        const result = await readMigration(testFlag, v1, v2, comparison)

        expect(result).toBe('new')
        expect(v1).not.toHaveBeenCalled()
        expect(v2).toHaveBeenCalled()
        expect(comparison).not.toHaveBeenCalled()
    })

    it('Should not throw if the non-authoritative branch throws', async () => {
        v2.mockRejectedValue(Error('Something happened'))
        ldClientMock.variation.mockReturnValue('shadow')

        const result = readMigration(testFlag, v1, v2)

        expect(result).resolves.toBe('old')
    })

    it('Should throw if the authoritative branch throws', async () => {
        v2.mockRejectedValue(Error('Something happened'))
        ldClientMock.variation.mockReturnValue('live')

        const result = readMigration(testFlag, v1, v2)

        expect(result).rejects.toThrow('Something happened')
    })
})
