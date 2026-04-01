import type { ComponentProps } from 'react'

import { Dot, Icon } from '@gorgias/axiom'

import css from './IconWithDot.less'

type Props = {
    size?: ComponentProps<typeof Icon>['size']
    name: ComponentProps<typeof Icon>['name']
    isDotVisible: boolean
}

export const IconWithDot = ({ size, name, isDotVisible }: Props) => (
    <div className={css.container}>
        <Icon size={size} name={name} />
        {isDotVisible && (
            <div
                className={css.dot}
                role="img"
                aria-label="Unread notification"
            >
                <Dot color="red" />
            </div>
        )}
    </div>
)
