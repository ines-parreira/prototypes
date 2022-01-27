import client from '../api/resources'
import {Job, JobRequestPayload} from './types'

export const createJob = async (
    requestPayload: JobRequestPayload
): Promise<Job> => {
    const res = await client.post('/api/jobs/', requestPayload)
    return res.data as Job
}
