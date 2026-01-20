import cn from 'classnames'

import { Icon, Text } from '@gorgias/axiom'
import type { MetafieldType } from '@gorgias/helpdesk-types'

import { TYPE_CONFIG } from '../constants'

import css from './MetafieldTypeItem.less'

export interface MetafieldTypeItemProps {
    type: MetafieldType
    disabled?: boolean
}

export default function MetafieldTypeItem({
    type,
    disabled = false,
}: MetafieldTypeItemProps) {
    const config = TYPE_CONFIG[type]
    const icon = config?.icon
    const label = config?.label ?? ''
    return (
        <div className={cn(css.container, { [css.disabled]: disabled })}>
            {icon && (
                <Icon
                    size="md"
                    aria-disabled={disabled ? true : undefined}
                    name={icon}
                />
            )}
            <Text>{label}</Text>
        </div>
    )
}
