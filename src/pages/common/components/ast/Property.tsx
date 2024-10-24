import classnames from 'classnames'
import {List, Map} from 'immutable'
import React, {ComponentProps, useMemo} from 'react'

import {Argument, Properties} from './actions/config'
import Errors from './Errors'
import Widget from './Widget'

type Props = {
    config?: ValueOf<Argument>
    compact?: boolean
    parent: List<any>
    schemas: Map<any, any>
    value: {value?: any}
}

function hasValidate(
    value?: Record<string, unknown>
): value is {validate: Properties['validate']} {
    return !!value && 'validate' in value
}

export default function Property({
    config,
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
        () => hasValidate(config) && config.validate(value.value, schemas),
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
