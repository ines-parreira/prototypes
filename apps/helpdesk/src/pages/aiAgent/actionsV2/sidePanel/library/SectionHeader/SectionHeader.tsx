import { Text } from '@gorgias/axiom'

import css from './SectionHeader.less'

type Props = {
    label: string
    resultCount?: number
    className?: string
}

export const SectionHeader = ({ label, resultCount, className }: Props) => (
    <div className={css.header + (className ? ' ' + className : '')}>
        <Text size="md" variant="medium" color="content-neutral-default">
            {label}
        </Text>
        {resultCount !== undefined && (
            <Text size="xs" color="content-neutral-secondary">
                {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </Text>
        )}
    </div>
)
