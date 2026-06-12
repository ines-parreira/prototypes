import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListJobsHandler,
    mockListJobsResponse,
} from '@gorgias/helpdesk-mocks'
import { JobStatus } from '@gorgias/helpdesk-types'

import { useRunningJobs } from '../useRunningJobs'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const jobWithStatus = (status: JobStatus) => ({
    status,
})

function renderUseRunningJobs() {
    return renderHook(() => useRunningJobs())
}

describe('useRunningJobs', () => {
    const runningJobs = [
        jobWithStatus(JobStatus.Pending),
        jobWithStatus(JobStatus.Running),
        jobWithStatus(JobStatus.Scheduled),
    ]
    const notRunningJobs = [
        jobWithStatus(JobStatus.Done),
        jobWithStatus(JobStatus.CancelRequested),
    ]

    it('should fetch the list of jobs and return true if some are in "running" state', async () => {
        const jobs = [...runningJobs, ...notRunningJobs]
        server.use(
            mockListJobsHandler(async () =>
                HttpResponse.json(mockListJobsResponse({ data: jobs })),
            ).handler,
        )

        const { result } = renderUseRunningJobs()

        await waitFor(() => {
            expect(result.current.running).toEqual(true)
        })
        expect(result.current.jobs).toEqual(jobs)
        expect(result.current.refetch).toEqual(expect.any(Function))
    })

    it('should fetch the list of jobs and return false if none are in "running" state', async () => {
        server.use(
            mockListJobsHandler(async () =>
                HttpResponse.json(
                    mockListJobsResponse({ data: notRunningJobs }),
                ),
            ).handler,
        )

        const { result } = renderUseRunningJobs()

        await waitFor(() => {
            expect(result.current.running).toEqual(false)
        })
        expect(result.current.jobs).toEqual(notRunningJobs)
        expect(result.current.refetch).toEqual(expect.any(Function))
    })

    it('should fetch the list of jobs and return null while the jobs are not available', () => {
        server.use(
            mockListJobsHandler(async () => {
                await new Promise(() => undefined)

                return HttpResponse.json(mockListJobsResponse({ data: [] }))
            }).handler,
        )

        const { result } = renderUseRunningJobs()

        expect(result.current.running).toEqual(null)
        expect(result.current.jobs).toEqual(undefined)
        expect(result.current.refetch).toEqual(expect.any(Function))
    })
})
