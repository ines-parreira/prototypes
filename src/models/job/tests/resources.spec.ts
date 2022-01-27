import MockAdapter from 'axios-mock-adapter'

import client from '../../api/resources'
import {createJob} from '../resources'
import {Job, JobType, JobStatus, JobRequestPayload} from '../types'

const mockedServer = new MockAdapter(client)
describe('job resources', () => {
    const jobRequestPayload: JobRequestPayload = {
        type: JobType.ExportMacro,
        params: {},
    }

    describe('createJob', () => {
        it('should resolve with a job on success', async () => {
            const mockJob: Partial<Job> = {
                id: 1,
                type: JobType.ExportMacro,
                status: JobStatus.Running,
                created_datetime: '2020-01-01T00:00:00Z',
                info: {progress_count: 0},
                meta: {},
                params: {},
                user_id: 1,
                uri: '',
            }

            mockedServer.onPost('/api/jobs/').reply(200, mockJob)
            const res = await createJob(jobRequestPayload)
            expect(res).toStrictEqual(mockJob)
        })

        it('should reject an error on fail', async () => {
            mockedServer.onPost('/api/jobs/').reply(503, {message: 'error'})

            return expect(createJob(jobRequestPayload)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
