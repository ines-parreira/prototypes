import { FileIngestionDataFixture } from '../../tests/FileIngestionData.fixture'
import { UploadAnExternalDocTask } from '../UploadAnExternalDoc.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('UploadAnExternalDoc', () => {
    it('should display the task if no file ingested', () => {
        const fileIngestion = FileIngestionDataFixture.start()
            .withNoIngestedFile()
            .build()

        const task = new UploadAnExternalDocTask(
            buildRuleEngineData({ fileIngestion }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })

    it.each([
        {
            type: 'PENDING',
            fileIngestion: FileIngestionDataFixture.start()
                .withPendingIngestedFile()
                .build(),
        },
        {
            type: 'FAILED',
            fileIngestion: FileIngestionDataFixture.start()
                .withFailedIngestedFile()
                .build(),
        },
        {
            type: 'SUCCESS',
            fileIngestion: FileIngestionDataFixture.start()
                .withSuccessfulIngestedFile()
                .build(),
        },
        {
            type: 'EACH',
            fileIngestion: FileIngestionDataFixture.start()
                .withSuccessfulIngestedFile()
                .withFailedIngestedFile()
                .withSuccessfulIngestedFile()
                .build(),
        },
    ])(
        'should not display the task if $type file exists',
        ({ fileIngestion }) => {
            const task = new UploadAnExternalDocTask(
                buildRuleEngineData({ fileIngestion }),
                buildRuleEngineRoutes(),
            )
            expect(task.display).toBe(false)
        },
    )
})
