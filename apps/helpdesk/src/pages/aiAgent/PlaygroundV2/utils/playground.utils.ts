export const getActionsToggleTooltipContent = (isEnabled: boolean) => {
    return isEnabled
        ? 'Actions triggered on existing tickets or customers will change live data. These changes are permanent and cannot be undone. Proceed with caution.'
        : 'Any Actions used by AI Agent in test conversations will not actually be performed and will not impact real customer or order data.'
}
