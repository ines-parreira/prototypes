import React, {PropTypes} from 'react'

import {DatetimeLabel} from '../../../common/utils/labels'
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
        const {currentUser, rule} = this.props
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
                    <td>
                        <DatetimeLabel
                            dateTime={rule.updated_datetime}
                            timezone={currentUser.get('timezone')}
                        />
                    </td>
                </tr>
                {this.state.showDetail && this._renderDetail()}
            </tbody>
        )
    }

}

RuleTableRow.propTypes = {
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object,
    index: PropTypes.number.isRequired,
    rule: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
}

export default RuleTableRow
