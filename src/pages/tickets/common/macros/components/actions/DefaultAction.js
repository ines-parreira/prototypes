import React, {PropTypes} from 'react'

class DefaultAction extends React.Component {
    render() {
        const {name, deleteAction, index} = this.props

        return (
            <div>
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4 className="inline">{name}</h4>
                <div className="ui divider"></div>
            </div>
        )
    }
}

DefaultAction.propTypes = {
    name: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    deleteAction: PropTypes.func.isRequired
}

export default DefaultAction
