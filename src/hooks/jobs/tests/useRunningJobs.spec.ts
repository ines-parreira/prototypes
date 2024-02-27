import {useListJobs} from '@gorgias/api-queries'
import {JobStatus} from '@gorgias/api-types'
import {renderHook} from '@testing-library/react-hooks'
import {useRunningJobs} from 'hooks/jobs/useRunningJobs'
import {assumeMock} from 'utils/testing'

jest.mock('@gorgias/api-queries')
const useListJobsMock = assumeMock(useListJobs)
const jobWithStatus = (status: JobStatus) => ({
    status,
})

const jobsResponse = (jobs: {status?: JobStatus}[]): any => ({
    data: {
        data: {
            data: jobs,
            meta: {
                prev_cursor: '',
                next_cursor: '',
            },
        },
    },
    refetch: jest.fn(),
})

describe('useRunningJobs', () => {
    const runningJobs = [
        jobWithStatus(JobStatus.pending),
        jobWithStatus(JobStatus.running),
        jobWithStatus(JobStatus.scheduled),
    ]
    const notRunningJobs = [
        jobWithStatus(JobStatus.done),
        jobWithStatus(JobStatus.cancel_requested),
    ]

    it('should fetch the list of jobs and return true if some are in "running" state', () => {
        const jobs = [...runningJobs, ...notRunningJobs]
        useListJobsMock.mockReturnValue(jobsResponse(jobs))

        const {result} = renderHook(() => useRunningJobs())

        expect(result.current.running).toEqual(true)
        expect(result.current.jobs).toEqual(jobs)
        expect(result.current.refetch).toEqual(expect.any(Function))
    })
    it('should fetch the list of jobs and return false if none are in "running" state', () => {
        useListJobsMock.mockReturnValue(jobsResponse(notRunningJobs))

        const {result} = renderHook(() => useRunningJobs())

        expect(result.current.running).toEqual(false)
        expect(result.current.jobs).toEqual(notRunningJobs)
        expect(result.current.refetch).toEqual(expect.any(Function))
    })

    it('should fetch the list of jobs and return null while the jobs are not available', () => {
        useListJobsMock.mockReturnValue({
            data: undefined,
            refetch: jest.fn(),
        } as any)

        const {result} = renderHook(() => useRunningJobs())

        expect(result.current.running).toEqual(null)
        expect(result.current.jobs).toEqual(undefined)
        expect(result.current.refetch).toEqual(expect.any(Function))
    })
})
