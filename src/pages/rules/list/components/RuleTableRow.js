import React, {PropTypes} from 'react'
import {connect} from 'react-redux'

import ToggleCheckbox from '../../../common/forms/ToggleCheckbox'

import {DatetimeLabel} from '../../../common/utils/labels'
import RuleItem from '../../detail/components/RuleItem'
import * as ruleSelectors from '../../../../state/rules/selectors'

class RuleTableRow extends React.Component {
    constructor(props) {
        super(props)
        this.state = {showDetail: false}
    }

    _toggleItem = () => {
        this.setState({showDetail: !this.state.showDetail})
    }

    _handleActivate = () => {
        const {actions, rule} = this.props
        actions.rules.activate(rule.get('id'))
    }

    _handleDeactivate = () => {
        const {actions, rule} = this.props

        if (confirm('Are you sure you want to deactivate this rule?')) {
            actions.rules.deactivate(rule.get('id'))
        }
    }

    _toggleItemStatus = (value) => {
        if (value) {
            this._handleActivate()
        } else {
            this._handleDeactivate()
        }
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
            <tbody className="table-row">
                <tr>
                    <td
                        onClick={this._toggleItem}
                        style={{cursor: 'pointer'}}
                    >
                        <div className="cell-wrapper">
                            <div className="ui header">
                                <span className="subject">
                                    {rule.get('title')}
                                </span>
                                {
                                    rule.get('type') === 'system' && <label className="ui red thin label">SYSTEM</label>
                                }
                                <div className="sub header">
                                    {rule.get('description')}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="cell-wrapper">
                            <ToggleCheckbox
                                input={{
                                    onChange: this._toggleItemStatus,
                                    value: !rule.get('deactivated_datetime'),
                                }}
                            />
                        </div>
                    </td>
                    <td className="right aligned">
                        <div className="cell-wrapper">
                            <DatetimeLabel
                                dateTime={rule.get('updated_datetime')}
                                timezone={currentUser.get('timezone')}
                            />
                        </div>
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
        isDirty: ruleSelectors.makeIsDirty(state)
    }
})

export default connect(mapStateToProps)(RuleTableRow)
