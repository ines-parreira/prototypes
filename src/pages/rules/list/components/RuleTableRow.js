import React, {PropTypes} from 'react'
import {connect} from 'react-redux'

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

    _handleActivate = (event) => {
        const {actions, rule} = this.props
        event.preventDefault()
        actions.rules.activate(rule.get('id'))
    }

    _handleDeactivate = (event) => {
        const {actions, rule} = this.props
        event.preventDefault()

        if (confirm('Are you sure you want to deactivate this rule?')) {
            actions.rules.deactivate(rule.get('id'))
        }
    }

    _toggleItemStatus = (event) => {
        if (this.props.rule.get('deactivated_datetime')) {
            this._handleActivate(event)
        } else {
            this._handleDeactivate(event)
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
                            <div
                                className="ui toggle checkbox"
                                onClick={this._toggleItemStatus}
                            >
                                <input
                                    type="checkbox"
                                    checked={!rule.get('deactivated_datetime')}
                                    readOnly
                                />
                                <label/>
                            </div>
                        </div>
                    </td>
                    {/*<td>*/}
                        {/*<div className="cell-wrapper">*/}
                            {/*{rule.get('usage')}*/}
                        {/*</div>*/}
                    {/*</td>*/}
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
