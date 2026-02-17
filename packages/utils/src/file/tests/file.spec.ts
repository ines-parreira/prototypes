import {
    createCsv,
    EOL,
    getFileTooLargeError,
    getText,
    saveZippedFiles,
} from '../file'

const mockedBlob = new Blob()
const mockFile = vi.fn()
const mockGenerateAsync = vi.fn().mockResolvedValue(mockedBlob)
vi.mock('jszip', () => ({
    default: vi.fn().mockImplementation(() => ({
        file: mockFile,
        generateAsync: mockGenerateAsync,
    })),
}))
const createObjectURLMock = vi.fn()
const revokeObjectURLMock = vi.fn()
global.URL.createObjectURL = createObjectURLMock
global.URL.revokeObjectURL = revokeObjectURLMock

describe('file util', () => {
    it('should get error for file too large in MB', () => {
        expect(getFileTooLargeError(1000 * 1000 * 10)).toEqual(
            'Failed to upload files. Attached files must be smaller than 10MB.',
        )
    })

    it('should get error for file too large in kB', () => {
        expect(getFileTooLargeError(1000 * 500)).toEqual(
            '' +
                'Failed to upload files. Attached files must be smaller than 500kB.',
        )
    })

    describe('getText', () => {
        it('should read the file as text', async () => {
            const contents = 'Line 1\nLine 2'
            const file = new File([contents], 'file.csv', { type: 'text/csv' })
            expect(await getText(file)).toEqual(contents)
        })
    })

    describe('createCsv', () => {
        it('should create a csv representation of the passed data', () => {
            const label = 'some label'
            const anotherLabel = 'someOtherLabel'
            const dataPiece = 123
            const anotherDataPiece = 567
            const data = [
                [label, anotherLabel],
                [dataPiece, anotherDataPiece],
            ]

            const csv = createCsv(data)

            expect(csv).toEqual(
                `"${label}","${anotherLabel}"${EOL}"${dataPiece}","${anotherDataPiece}"`,
            )
        })
    })

    describe('saveZippedFiles', () => {
        it('should call saveAs with zipped archive', async () => {
            const fileName = 'someFileName.extension'
            const fileContent = 'someFileContent'

            await saveZippedFiles({
                [fileName]: fileContent,
            })

            expect(mockFile).toHaveBeenCalledWith(fileName, fileContent)
            expect(createObjectURLMock).toHaveBeenCalledWith(mockedBlob)
        })
    })
})
