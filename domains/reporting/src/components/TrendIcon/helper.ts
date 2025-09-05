import { IconName } from '@gorgias/axiom'

export const ARROW_UP = 'arrow-up'
export const ARROW_DOWN = 'arrow-down'

export const getIconNameFromValue = (value: number): IconName | null => {
    if (value > 0) {
        return ARROW_UP
    } else if (value < 0) {
        return ARROW_DOWN
    }
    return null
}
