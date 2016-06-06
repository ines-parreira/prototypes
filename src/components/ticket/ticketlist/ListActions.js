import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class ListActions extends React.Component {
    componentDidUpdate(prevProps) {
        if (!prevProps.shouldDisplayBulkActions && this.props.shouldDisplayBulkActions) {
            $('#bulkStatusDropdown').dropdown({
                hoverable: true,
                on: 'hover'
            })

            $('#bulkMoreDropdown').dropdown({
                hoverable: true,
                on: 'hover'
            })

            $('#bulkTagDropdown').dropdown({
                hoverable: true,
                on: 'hover'
            })
        }
    }

    renderBulkActions(shouldDisplay) {
        if (!shouldDisplay) {
            return null
        }

        return (
            <div>
                <div className="BulkAction ui right floated buttons">
                    <div id="bulkTagDropdown" className="ui basic grey button floating dropdown">
                        Tag <i className="dropdown icon"/>
                        <div className="menu">
                            <div className="item">Refund</div>
                            <div className="item">Rejected</div>
                        </div>
                    </div>

                    <div id="bulkMoreDropdown" className="ui basic grey button floating dropdown">
                        More <i className="dropdown icon"/>
                        <div className="menu">
                            <div className="item">Apply macro...</div>
                            <div className="item">Mark as high priority</div>
                            <div className="item">Mark as normal priority</div>
                            <div className="divider"></div>
                            <div className="item">Delete tickets</div>
                        </div>
                    </div>

                </div>

                <div className="BulkAction ui right floated buttons">
                    <div className="ui basic grey button">Close</div>
                    <div id="bulkStatusDropdown" className="ui basic grey floating dropdown icon button item">
                        <i className="dropdown icon"/>
                        <div className="menu">
                            <div className="item">OPEN</div>
                            <div className="item">NEW</div>
                        </div>
                    </div>
                </div>

                <div className="BulkAction ui right floated buttons">
                    <div className="ui basic grey button">Assign to me</div>
                    <div className="ui basic grey floating dropdown icon button">
                        <i className="dropdown icon"/>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const { views, shouldDisplayBulkActions } = this.props

        return (
            <div className="ListActions">

                <button
                    className="ui right floated green button"
                    onClick={() => { browserHistory.push(`/app/ticket/new?view=${views.getIn(['active', 'slug'])}`) }}
                >
                    CREATE TICKET
                </button>

                <ReactCSSTransitionGroup
                    transitionName="fade"
                    transitionAppear
                    transitionAppearTimeout={200}
                    transitionEnterTimeout={200}
                    transitionLeaveTimeout={200}
                >
                    {this.renderBulkActions(shouldDisplayBulkActions)}
                </ReactCSSTransitionGroup>

            </div>
        )
    }
}

ListActions.propTypes = {
    views: PropTypes.object.isRequired,
    shouldDisplayBulkActions: PropTypes.bool.isRequired
}
