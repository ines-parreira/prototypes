import React from 'react'
import _pick from 'lodash/pick'
import {Map, List} from 'immutable'

import {RuleItemActions} from '../../../../settings/rules/detail/components/RuleItem/RuleItem'
import Property from '../Property.js'
import {ActionConfig} from '../actions/Action'

type Props = {
    leftsiblings: List<any>
    parent: List<any>
    properties: any[]
    config: ActionConfig
    rule: Map<any, any>
    schemas: Map<any, any>
    actions: RuleItemActions
    className?: string
    compact?: boolean
}

export default class ObjectExpression extends React.Component<Props> {
    render() {
        const {properties, leftsiblings, parent, config} = this.props

        const propertiesComp = properties.map(
            (
                property: {
                    key: {name: keyof typeof config.args}
                    value: string
                },
                idx
            ) => {
                let leftsiblings2
                if (leftsiblings !== undefined) {
                    leftsiblings2 = leftsiblings.push(property.key.name)
                }

                const parentProperty = parent.push('properties', idx)
                const argConfig =
                    config && config.args ? config.args[property.key.name] : {}

                if (argConfig && (argConfig as {hide?: boolean}).hide) {
                    return null
                }

                const propsToPass = _pick(this.props, [
                    'compact',
                    'className',
                    'actions',
                    'schemas',
                    'rule',
                    'properties',
                ])

                return (
                    <Property
                        {...propsToPass}
                        key={idx}
                        value={property.value}
                        theKey={property.key}
                        leftsiblings={leftsiblings2 as List<any>}
                        parent={parentProperty}
                        config={argConfig}
                    />
                )
            }
        )

        return <div>{propertiesComp}</div>
    }
}
