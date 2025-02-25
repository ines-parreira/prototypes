import { FileIngestionData } from '../useFetchFileIngestionData'

type AllKeys = keyof FileIngestionDataFixture
type ConfiguredFileIngestionDataFixture<
    ToKeepFunctions extends keyof FileIngestionDataFixture,
> = Omit<FileIngestionDataFixture, Exclude<AllKeys, ToKeepFunctions>>

export type FileIngestionDataFixtureFullyConfigured =
    ConfiguredFileIngestionDataFixture<'build'>

type InternalData = {
    helpCenterId: number
    fileId: number
}
export class FileIngestionDataFixture {
    private internalData: InternalData = {
        helpCenterId: 1,
        fileId: 1,
    }
    private fileIngestionData: FileIngestionData

    private constructor() {
        this.fileIngestionData = []
    }

    static start() {
        return new FileIngestionDataFixture() as ConfiguredFileIngestionDataFixture<
            | 'withNoIngestedFile'
            | 'withPendingIngestedFile'
            | 'withFailedIngestedFile'
            | 'withSuccessfulIngestedFile'
        >
    }

    withHelpCenterId(helpcenterId: number) {
        this.internalData.helpCenterId = helpcenterId
        return this as ConfiguredFileIngestionDataFixture<
            | 'withNoIngestedFile'
            | 'withPendingIngestedFile'
            | 'withFailedIngestedFile'
            | 'withSuccessfulIngestedFile'
        >
    }

    withNoIngestedFile() {
        return this as FileIngestionDataFixtureFullyConfigured
    }

    private withIngestedFile(status: 'PENDING' | 'FAILED' | 'SUCCESSFUL') {
        this.fileIngestionData.push({
            status,
            id: this.internalData.fileId++,
            filename: 'file',
            google_storage_url: 'https://google.com',
            help_center_id: this.internalData.helpCenterId,
            uploaded_datetime: '2021-01-01T00:00:00Z',
        })
    }

    withPendingIngestedFile() {
        this.withIngestedFile('PENDING')
        return this as ConfiguredFileIngestionDataFixture<
            | 'withPendingIngestedFile'
            | 'withFailedIngestedFile'
            | 'withSuccessfulIngestedFile'
            | 'build'
        >
    }

    withFailedIngestedFile() {
        this.withIngestedFile('FAILED')
        return this as ConfiguredFileIngestionDataFixture<
            | 'withPendingIngestedFile'
            | 'withFailedIngestedFile'
            | 'withSuccessfulIngestedFile'
            | 'build'
        >
    }

    withSuccessfulIngestedFile() {
        this.withIngestedFile('SUCCESSFUL')
        return this as ConfiguredFileIngestionDataFixture<
            | 'withPendingIngestedFile'
            | 'withFailedIngestedFile'
            | 'withSuccessfulIngestedFile'
            | 'build'
        >
    }

    build(): FileIngestionData {
        return this.fileIngestionData
    }
}
