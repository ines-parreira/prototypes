/* istanbul ignore file */
import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import { useAxiomMigration } from 'hooks/useAxiomMigration'

import css from './AxiomMigrationHighlightTokensToggle.less'

export default function AxiomMigrationHighlightTokensToggle() {
    const {
        hasFlag,
        isEnabled,
        isDebugging,
        isHighlightingTokens,
        onToggleTokenHighlighting,
    } = useAxiomMigration()

    if (!hasFlag || !isEnabled || !isDebugging) {
        return null
    }

    return (
        <div className={css.container}>
            <ToggleField
                value={isHighlightingTokens}
                onChange={() => onToggleTokenHighlighting()}
                label="Highlight legacy tokens"
            />
        </div>
    )
}
