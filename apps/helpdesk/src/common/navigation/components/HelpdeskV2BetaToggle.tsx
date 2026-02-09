/* istanbul ignore file */
import { useHelpdeskV2BaselineFlag } from '@repo/feature-flags'
import cn from 'classnames'

import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import css from './UserMenu.less'

export function HelpdeskV2BetaToggle() {
    const { hasUIVisionBeta, onToggle } = useHelpdeskV2BaselineFlag()

    return (
        <button
            className={cn(
                css['dropdown-item-user-menu'],
                css.availabilityToggle,
            )}
            onClick={onToggle}
        >
            <span>New UI</span>
            <ToggleField value={hasUIVisionBeta} />
        </button>
    )
}
