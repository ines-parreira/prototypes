import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import * as TicketActions from '../actions/ticket'
import { bindActionCreators } from 'redux'

class Attachments extends React.Component {
    render() {
        return (
            <div className="enumerable-list">
                {
                    this.props.attachments.map((o, i) => (
                        <div
                            className="enumerable-item"
                            key={i}
                        >
                            <div className="enumerable-item-label">
                            {
                                `${o.name} (${(o.size / 1024).toFixed(2)}K)`
                            }
                            </div>
                            <div className="enumerable-item-opts">
                                <div
                                    className="enumerable-item-close"
                                    onClick={ () => this.props.actions.deleteAttachment(i) }
                                >x</div>
                            </div>
                        </div>
                    ))
                }
            </div>
        )
    }
}

Attachments.propTypes = {
    attachments: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        attachments: state.ticket.get('newMessage').get('attachments')
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(TicketActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Attachments)
