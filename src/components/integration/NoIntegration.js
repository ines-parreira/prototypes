import React, {PropTypes} from 'react'


export default class NoIntegrations extends React.Component {
    render() {
        return (<tr>
            <td>
                {`You have no active ${this.props.type} integration at the moment.`}
            </td>
        </tr>)
    }
}


NoIntegrations.propTypes = {
    type: PropTypes.string.isRequired
}
