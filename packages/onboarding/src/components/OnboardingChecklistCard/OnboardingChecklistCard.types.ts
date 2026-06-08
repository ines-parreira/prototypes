export type ChecklistTaskStatus = 'pending' | 'completed'

export type ChecklistTask = {
    /** Label shown for the step. */
    content: string
    status: ChecklistTaskStatus
}
