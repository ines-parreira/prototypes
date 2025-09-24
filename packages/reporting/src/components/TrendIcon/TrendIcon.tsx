import { Icon } from '@gorgias/axiom'

export const getIconNameFromValue = (value: number) => {
    if (value > 0) {
        return 'arrow-up'
    } else if (value < 0) {
        return 'arrow-down'
    }
    return null
}

/**
 * TrendBadge Icon component.
 *
 * @deprecated should only be replaced by TrendBadge component
 * @date 2025-09-05
 * @type reporting-ui-kit
 * This icon indicates upward/downward trends.
 * Its design and guidelines are documented in Figma:
 * https://www.figma.com/design/GRRRt5lGjjNi7JOd0J2Vzk/%F0%9F%AB%A7--Library--Analytics-UI-Kit?node-id=4762-19153&m=dev
 *
 * Props:
 * - value: number
 *   Each value is associated with a specific icon:
 *    Positive > 0: 'arrow-up'
 *    Negative < 0: 'arrow-down'
 *    0: no icon
 *
 * @see Figma design for visual details
 */
export const TrendIcon = ({ value }: { value: number }) => {
    const iconName = getIconNameFromValue(value)

    if (!iconName) return null

    return <Icon name={iconName} size="xs" />
}
