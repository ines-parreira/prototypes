import {getFileTooLargeError, getText} from '../file'

describe('file util', () => {
    it('should get error for file too large in MB', () => {
        expect(getFileTooLargeError(1000 * 1000 * 10)).toEqual(
            'Failed to upload files. Attached files must be smaller than 10MB.'
        )
    })

    it('should get error for file too large in kB', () => {
        expect(getFileTooLargeError(1000 * 500)).toEqual(
            '' +
                'Failed to upload files. Attached files must be smaller than 500kB.'
        )
    })

    describe('getText', () => {
        it('should read the file as text', async () => {
            const contents = 'Line 1\nLine 2'
            const file = new File([contents], 'file.csv', {type: 'text/csv'})
            expect(await getText(file)).toEqual(contents)
        })
    })
})
