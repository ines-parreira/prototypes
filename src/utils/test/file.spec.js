import {getFileTooLargeError} from '../file'

describe('file util', () => {
    it('should get error for file too large in MB', () => {
        expect(getFileTooLargeError(1000 * 1000 * 10)).toEqual(
            'Failed to upload files. Attached files must be smaller than 10MB.')
    })

    it('should get error for file too large in kB', () => {
        expect(getFileTooLargeError(1000 * 500)).toEqual('' +
            'Failed to upload files. Attached files must be smaller than 500kB.')
    })
})
