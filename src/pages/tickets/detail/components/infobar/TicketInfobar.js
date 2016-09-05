import React, {PropTypes} from 'react'
import {List, fromJS} from 'immutable'
import InfobarWidget from './InfobarWidget'
import {isTicketDifferent} from './../../../common/utils'

export default class TicketInfobar extends React.Component {
    shouldComponentUpdate(nextProps) {
        return isTicketDifferent(this.props.ticket, nextProps.ticket) ||
            !this.props.widgets.equals(nextProps.widgets) ||
            !this.props.currentUser.equals(nextProps.currentUser)
    }

    render() {
        const {ticket, widgets, currentUser} = this.props
        if (!ticket || !widgets.get('items').size) {
            return null
        }

        const items = List(widgets.get('items'))
        const topWidgets = items.filter(w => w.type === 'top').sortBy(w => w.order)
        const bottomWidgets = items.filter(w => w.type === 'bottom').sortBy(w => w.order)
        const contentWidgets = items.filter(w => !~['top', 'bottom'].indexOf(w.type)).sortBy(w => w.order)

        const renderWidgets = (widgetList) => (
            widgetList.map(w => {
                let object = null

                if (w.object_path) {
                    const path = w.object_path.split('.')

                    // if we have a path that starts with a ticket we should try to get the object from the ticket
                    if (path && path[0] === 'ticket') {
                        object = fromJS(ticket.toJS()).getIn(path.slice(1))
                    }
                }

                if (!object) {
                    return null
                }

                if (w.type === 'list') {
                    return object.map((o, i) => (
                        <InfobarWidget
                            key={`infobar-widget-${w.id}-${i}`}
                            object={o}
                            widget={w}
                            widgets={widgetList}
                            currentUser={currentUser}
                        />
                    ))
                }
                return (
                    <InfobarWidget
                        key={`infobar-widget-${w.id}`}
                        object={object}
                        widget={w}
                        widgets={widgetList}
                        currentUser={currentUser}
                    />
                )
            })
        )

        return (
            <div className="infobar-content">
                {/* <div className="infobar-top infobar-box infobar-search">
                 <Search id="ticket"/>
                 </div> */}
                <div className="infobar-top infobar-box">
                    <h2>{ticket.getIn(['requester', 'name'])}</h2>
                    {renderWidgets(topWidgets.toJS())}
                </div>
                <div className="infobar-section-separator"></div>
                <div className="infobar-middle-content infobar-box ui two stackable cards">
                    {renderWidgets(contentWidgets.toJS())}
                </div>
                <div className="infobar-bottom infobar-box">
                    {renderWidgets(bottomWidgets.toJS())}
                </div>
            </div>
        )
    }
}

TicketInfobar.propTypes = {
    widgets: PropTypes.object,
    ticket: PropTypes.object,
    currentUser: PropTypes.object
}
