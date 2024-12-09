export type RemovableFilter = {
    initializeAsOpen?: boolean
    onRemove?: () => void
}

export type OptionalFilterProps = {
    warningType?: 'not-applicable' | 'non-existent' | undefined
    dispatchRemoveDraftFilter?: () => void
}
