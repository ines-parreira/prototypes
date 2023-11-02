import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import uploadFiles from '../uploadFiles'

describe('uploadFiles()', () => {
    let mockServer: MockAdapter

    beforeEach(() => {
        mockServer = new MockAdapter(client)
    })

    it('should post files to the upload API', () => {
        const name = 'foo.jpg'
        const uploadedFileData = {data: [{name, foo: 'bar'}]}

        mockServer.onPost('/api/upload/').reply(200, uploadedFileData)

        const file = new File([''], name)
        return uploadFiles([file]).then((data) => {
            expect(data).toEqual(uploadedFileData)
        })
    })

    it('should post files to the upload API and pass the passed params', () => {
        const name = 'foo.jpg'
        const uploadedFileData = {data: [{name, foo: 'bar'}]}
        const passedParams = {type: 'profile_picture', foo: 'bar'}

        mockServer.onPost('/api/upload/').reply(({params}) => {
            expect(params).toEqual(passedParams)
            return [200, uploadedFileData]
        })

        const file = new File([''], name)
        return uploadFiles([file], passedParams).then((data) => {
            expect(data).toEqual(uploadedFileData)
        })
    })
})
