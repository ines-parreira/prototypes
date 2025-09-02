import { getIconNameFromValue } from './helper'

/**
 * TrendBadge Icon component.
 *
 * This icon indicates upward/downward trends.
 * Its design and guidelines are documented in Figma:
 * https://www.figma.com/design/GRRRt5lGjjNi7JOd0J2Vzk/%F0%9F%AB%A7--Library--Analytics-UI-Kit?node-id=4762-19153&m=dev
 *
 * Props:
 * - value: number
 *   Each value is associated with a specific icon:
 *    1: 'arrow_upward'
 *   -1: 'arrow_downward'
 *    0: no icon
 *
 * @see Figma design for visual details
 */

export const TrendIcon = ({ value }: { value: number }) => {
    return (
        <i className="material-icons-round mr-1 icon-12">
            {getIconNameFromValue(value)}
        </i>
    )
}
