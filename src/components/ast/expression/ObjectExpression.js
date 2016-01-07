import React, {PropTypes} from 'react'
import Property from '../Property'

/* interface ObjectExpression <: Expression {
 type: "ObjectExpression";
 properties: [ Property ];
 }
 */
export default class ObjectExpression extends React.Component {
    render() {
        const { type, properties, leftsiblings, parent, actions, index, schemas } = this.props
        const propertiesComp = properties.map((property, idx) => {
            let leftsiblings2
            if (leftsiblings !== undefined) {
                leftsiblings2 = leftsiblings.push(property.key.name)
            }

            const parentProperty = parent.push('properties', idx)
            return (
                <Property
                    { ...property }
                    key={ idx }
                    theKey={ property.key }
                    leftsiblings={ leftsiblings2 }
                    parent={ parentProperty }
                    actions={ actions }
                    schemas={ schemas }
                    index={ index }
                />
            )
        })

        return (
            <div>{ propertiesComp }</div>
        )
    }
}

ObjectExpression.propTypes = {
    type: PropTypes.string
}
