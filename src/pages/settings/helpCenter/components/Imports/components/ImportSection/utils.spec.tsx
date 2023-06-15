import {
    emptyMigrationStats,
    migrationStatsWithFailures,
    migrationStatsWithoutFailures,
    succeededMigrationStats,
} from './fixtures/migration-sessions'
import {parseSessionStats} from './utils'

describe('utils', () => {
    describe('parseSessionStats', () => {
        test('should match snapshots', () => {
            expect(
                parseSessionStats({stats: emptyMigrationStats})
            ).toMatchSnapshot()
            expect(
                parseSessionStats({stats: succeededMigrationStats})
            ).toMatchSnapshot()
            expect(
                parseSessionStats({stats: migrationStatsWithFailures})
            ).toMatchSnapshot()
            expect(
                parseSessionStats({stats: migrationStatsWithoutFailures})
            ).toMatchSnapshot()
        })
    })
})
