import { Text } from '@gorgias/axiom'

import { EntryRow } from './EntryRow'
import type { HttpActionModalSection } from './transforms'

import css from './HttpActionSection.less'

type HttpActionSectionProps = {
    section: HttpActionModalSection
}

export function HttpActionSection({ section }: HttpActionSectionProps) {
    return (
        <div className={css.section}>
            {section.title && (
                <Text size="sm" variant="bold">
                    {section.title}
                </Text>
            )}
            {section.entries.map((entry) => (
                <div key={`${entry.key}-${entry.value}`} className={css.entry}>
                    <EntryRow entry={entry} />
                </div>
            ))}
        </div>
    )
}
