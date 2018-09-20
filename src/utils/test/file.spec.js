import {ATTACHMENT_SIZE_ERROR} from '../file'

describe('file util', () => {
    describe('ATTACHMENT_SIZE_ERROR', () => {
        it('should have the correct size limit', () => {
            expect(ATTACHMENT_SIZE_ERROR).toEqual({
                status: 'error',
                message: 'Failed to upload files. Attached files must be smaller than 10MB.'
            })
        })
    })
})
