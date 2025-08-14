import classNames from 'classnames'

import { Icon, IconName } from '@gorgias/axiom'

import css from './StepCardIcon.less'

type StepCardIcon = {
    backgroundColor:
        | 'blue'
        | 'coral'
        | 'fuchsia'
        | 'purple'
        | 'orange'
        | 'green'
        | 'yellow'
        | 'teal'
    name: IconName
}

export function StepCardIcon({
    backgroundColor,
    name,
}: StepCardIcon): JSX.Element {
    return (
        <div className={classNames(css.icon, css[backgroundColor])}>
            <Icon name={name} />
        </div>
    )
}
