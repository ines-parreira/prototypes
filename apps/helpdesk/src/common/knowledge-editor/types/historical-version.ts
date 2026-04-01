export type ImpactDateRange = {
    start_datetime: string
    end_datetime: string
}

export type HistoricalVersionState = {
    versionId: number
    version: number
    title: string
    content: string
    publishedDatetime: string | null
    publisherUserId?: number
    commitMessage?: string
    impactDateRange?: ImpactDateRange
} | null

export type VersionPayload = {
    id: number
    version: number
    title: string
    content: string
    published_datetime: string | null
    publisher_user_id?: number
    commit_message?: string
    impactDateRange: ImpactDateRange
}
