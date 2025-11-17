import client from 'models/api/resources'
import type { Job, JobRequestPayload } from 'models/job/types'

export const JOBS_PATH = '/api/jobs/'

export const createJob = async (
    requestPayload: JobRequestPayload,
): Promise<Job> => {
    const response = await client.post<Job>(JOBS_PATH, requestPayload)

    return response.data
}
