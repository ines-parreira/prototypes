type ShouldShowLimitTooltipParams = {
    isDisabled: boolean
    isCurrentlySelected: boolean
    isSupportedType: boolean
    hasReachedLimit: boolean
}
export const shouldShowLimitTooltip = ({
    isDisabled,
    isCurrentlySelected,
    isSupportedType,
    hasReachedLimit,
}: ShouldShowLimitTooltipParams): boolean => {
    return (
        isDisabled && !isCurrentlySelected && isSupportedType && hasReachedLimit
    )
}
