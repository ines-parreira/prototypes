import { Button } from '@gorgias/axiom'

import css from './EmptyState.less'

type EmptyStateProps = {
    description: string
    title: string
    ctaButtonLabel: string
    ctaButtonCallback: () => void
}

export const EmptyState = ({
    description,
    title,
    ctaButtonLabel,
    ctaButtonCallback,
}: EmptyStateProps) => (
    <div className={css.emptyStateWrapper}>
        <h3 className={css.subTitle}>{title}</h3>
        <p>{description}</p>
        <Button onClick={ctaButtonCallback}>{ctaButtonLabel}</Button>
    </div>
)
