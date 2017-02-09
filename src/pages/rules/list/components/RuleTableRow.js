import React, {PropTypes} from 'react'
import {connect} from 'react-redux'

import {DatetimeLabel} from '../../../common/utils/labels'
import RuleItem from '../../detail/components/RuleItem'
import {createIsDirtySelector} from '../../../../state/rules/selectors'

class RuleTableRow extends React.Component {
    constructor(props) {
        super(props)
        this.state = {showDetail: false}
    }

    _toggleItem = () => {
        this.setState({showDetail: !this.state.showDetail})
    }

    _renderDetail = () => {
        const {rule, actions, selectors} = this.props

        if (!this.state.showDetail) {
            return null
        }

        return (
            <tr className="no-hover">
                <td colSpan="100%">
                    <RuleItem
                        rule={rule}
                        actions={actions}
                        isDirty={selectors.isDirty(rule.get('id'))}
                    />
                </td>
            </tr>
        )
    }

    render() {
        const {currentUser, rule} = this.props
        return (
            <tbody>
                <tr onClick={this._toggleItem} style={{cursor: 'pointer'}}>
                    <td>
                        <div className="ui header">
                            <span className="subject">{rule.get('title')}</span>
                            <div className="sub header">
                                {rule.get('description')}
                            </div>
                        </div>
                    </td>
                    <td className="right aligned">
                        <DatetimeLabel
                            dateTime={rule.get('updated_datetime')}
                            timezone={currentUser.get('timezone')}
                        />
                    </td>
                </tr>
                {this._renderDetail()}
            </tbody>
        )
    }
}

RuleTableRow.propTypes = {
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object,
    rule: PropTypes.object.isRequired,
    selectors: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    currentUser: state.currentUser,
    selectors: {
        isDirty: createIsDirtySelector(state)
    }
})

export default connect(mapStateToProps)(RuleTableRow)
