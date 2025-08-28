/* istanbul ignore file */
import { ToggleField } from '@gorgias/axiom'

import { useAxiomMigration } from 'hooks/useAxiomMigration'

import css from './AxiomMigrationHighlightTokensToggle.less'

export default function AxiomMigrationHighlightTokensToggle() {
    const {
        hasFlag,
        isEnabled,
        isHighlightingTokens,
        onToggleTokenHighlighting,
    } = useAxiomMigration()

    if (!hasFlag || !isEnabled) {
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
