export const getIconNameFromValue = (value: number) => {
    if (value > 0) {
        return 'arrow_upward'
    } else if (value < 0) {
        return 'arrow_downward'
    }
    return null
}
