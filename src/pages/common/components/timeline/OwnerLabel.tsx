import cn from 'classnames'

import css from './OwnerLabel.less'

export function OwnerLabel({
    type,
    owner,
}: {
    type: 'agent' | 'team'
    owner?: string
}) {
    let label = type === 'agent' ? 'Unassigned' : 'No team assigned'
    if (owner) label = owner

    return (
        <span
            className={cn(css.owner, {
                [css.warning]: !owner && type === 'agent',
            })}
        >
            {type === 'agent' ? (
                <span className={cn('material-icons', css.icon)}>
                    account_circle
                </span>
            ) : (
                <div className={css.teamIcon} />
            )}
            <span className={css.textContent}>{label}</span>
        </span>
    )
}
