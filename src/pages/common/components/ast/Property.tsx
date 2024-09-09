import React, {ComponentProps, useMemo} from 'react'
import classnames from 'classnames'
import {List, Map} from 'immutable'

import Widget from './Widget'
import Errors from './Errors'
import {validateEmailList} from './actions/config'

type Props = {
    config?: {
        validate?: typeof validateEmailList
    }
    compact?: boolean
    parent: List<any>
    schemas: Map<any, any>
    value: {value?: any}
}

export default function Property({
    config = {},
    compact = false,
    parent,
    schemas,
    value,
    ...props
}: Props &
    Pick<
        ComponentProps<typeof Widget>,
        'actions' | 'className' | 'leftsiblings' | 'properties' | 'rule'
    >) {
    const error = useMemo(
        () => config.validate?.(value.value, schemas),
        [config, schemas, value.value]
    )

    return (
        <div
            className={classnames({
                'd-flex': compact,
            })}
        >
            <Widget
                config={config}
                compact={compact}
                parent={parent.push('value', 'value')}
                schemas={schemas}
                value={value.value}
                {...props}
            />
            {!!error && <Errors belowInput>{error}</Errors>}
        </div>
    )
}
