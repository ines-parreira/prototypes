import type { List, Map } from 'immutable'

import type {
    ActionConfig,
    Argument,
} from 'pages/common/components/ast/actions/config'
import type { RuleItemActions } from 'pages/settings/rules/types'
import type { ObjectExpressionProperty } from 'state/rules/types'

import Property from '../Property'

type Props = {
    actions: RuleItemActions
    className?: string
    compact?: boolean
    config: ActionConfig
    leftsiblings?: List<any>
    parent: List<any>
    properties: ObjectExpressionProperty[]
    rule: Map<any, any>
    schemas: Map<any, any>
}

function hasHidden(
    value?: Record<string, unknown>,
): value is { hide: boolean } {
    return !!value && 'hide' in value
}

export default function ObjectExpression({
    actions,
    className,
    compact,
    config,
    leftsiblings,
    parent,
    properties,
    rule,
    schemas,
}: Props) {
    return (
        <>
            {properties.map((property, index) => {
                const args = config.args?.[property.key.name as keyof Argument]

                if (hasHidden(args) && args.hide) {
                    return null
                }

                return (
                    <Property
                        key={index}
                        className={className}
                        actions={actions}
                        compact={compact}
                        config={args}
                        leftsiblings={
                            leftsiblings !== undefined
                                ? leftsiblings.push(property.key.name)
                                : undefined
                        }
                        parent={parent.push('properties', index)}
                        properties={properties}
                        rule={rule}
                        schemas={schemas}
                        value={property.value}
                    />
                )
            })}
        </>
    )
}
