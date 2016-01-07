import React, {PropTypes} from 'react'
import DropdownButton from './Dropdown'

/*
 interface Identifier <: Node, Expression, Pattern {
 type: "Identifier";
 name: string;
 }
 */
export default class Identifier extends React.Component {
    render() {
        const { type, name, parent, index, actions, schemas, leftsiblings } = this.props
        const parentNew = parent.push('name')

        switch (name) {
            case 'Action':
                return (
                    <button className="ui orange button inline">TAKE ACTION</button>
                )
            case 'list_of_actions':
                return (
                    <span />
                )

            default:
                return (
                    <span className="Identifier">
                         <DropdownButton
                             text={name}
                             parent={parentNew}
                             index={index}
                             actions={actions}
                             leftsiblings={leftsiblings}
                             schemas={schemas}
                         />
                    </span>
                )
        }
    }
}

Identifier.propTypes = {
    type: PropTypes.string,
    schemas: PropTypes.object
}
