import React, {PropTypes} from 'react'
import DropdownButton from './Dropdown'

/*
 interface Literal <: Node, Expression {
 type: "Literal";
 value: string | boolean | null | number | RegExp;
 }
 */
export default class Literal extends React.Component {
    render() {
        const { type, value, index, actions, parent, leftsiblings } = this.props

        const parentNew = parent.push('value')

        return (

            <span className="Literal">
                <DropdownButton text={ value } parent={ parentNew } index={ index } actions={ actions }
                                leftsiblings={ leftsiblings }/>
            </span>
        )
    }
}

Literal.propTypes = {
    type: PropTypes.string
}
