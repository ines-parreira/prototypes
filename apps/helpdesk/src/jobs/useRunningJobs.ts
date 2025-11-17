import { useListJobs } from '@gorgias/helpdesk-queries'
import type { Job } from '@gorgias/helpdesk-types'
import { JobStatus } from '@gorgias/helpdesk-types'

const RUNNING_JOB_STATUSES: string[] = [
    JobStatus.Running,
    JobStatus.Pending,
    JobStatus.Scheduled,
]

const isAnyJobRunning = (jobs: Partial<Pick<Job, 'status'>>[]): boolean => {
    return jobs.reduce<boolean>(
        (jobsRunning, job) =>
            RUNNING_JOB_STATUSES.includes(String(job?.status))
                ? true
                : jobsRunning,
        false,
    )
}

export const useRunningJobs = () => {
    const response = useListJobs()
    const jobs = response?.data?.data?.data

    return {
        jobs: jobs,
        running: jobs ? isAnyJobRunning(jobs) : null,
        refetch: response.refetch,
    }
}
