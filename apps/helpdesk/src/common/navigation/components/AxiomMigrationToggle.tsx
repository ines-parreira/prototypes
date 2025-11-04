/* istanbul ignore file */
import cn from 'classnames'

import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import { useAxiomMigration } from 'hooks/useAxiomMigration'

import css from './UserMenu.less'

export function AxiomMigrationToggle() {
    const { isEnabled, onToggle } = useAxiomMigration()

    return (
        <button
            className={cn(
                css['dropdown-item-user-menu'],
                css.availabilityToggle,
            )}
            onClick={onToggle}
        >
            <span>Axiom Migration</span>
            <ToggleField value={isEnabled} />
        </button>
    )
}
