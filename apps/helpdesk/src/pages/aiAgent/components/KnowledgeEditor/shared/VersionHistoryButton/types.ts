export interface VersionItem {
    id: number
    version: number
    commit_message?: string
    created_datetime?: string
    published_datetime?: string | null
    publisher_user_id?: number
}

export type VersionHistoryButtonProps<V extends VersionItem> = {
    versions: V[]
    isLoading: boolean
    currentVersionId: number | null
    selectedVersionId: number | null
    onSelectVersion: (version: V) => void
    isDisabled: boolean
    isFetchingNextPage?: boolean
    onLoadMore?: () => void
    shouldLoadMore?: boolean
}
