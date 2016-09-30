import React from 'react'

import RuleItem from '../../detail/components/RuleItem'

class RuleTableRow extends React.Component {

    constructor() {
        super()
        this.state = { showDetail: false }
    }

    _toggleItem = () => {
        this.setState({ showDetail: !this.state.showDetail })
    }

    _renderDetail = () => {
        const { index, rule, schemas, actions } = this.props
        return (
            <tr className="no-hover">
                <td colSpan="100%">
                    <RuleItem index={index} rule={rule} schemas={schemas} actions={actions} />
                </td>
            </tr>
        )
    }

    render() {
        const { rule } = this.props
        return (
            <tbody>
                <tr onClick={this._toggleItem}>
                    <td>
                        <div className="ui header">
                            <span className="subject">{rule.title}</span>
                            <div className="sub header">
                                {rule.description}
                            </div>
                        </div>
                    </td>
                    <td>{rule.updated_datetime}</td>
                </tr>
                {this.state.showDetail && this._renderDetail()}
            </tbody>
        )
    }

}

RuleTableRow.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    rule: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
}

export default RuleTableRow
