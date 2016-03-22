import React, { PropTypes } from 'react'

import { List, fromJS } from 'immutable'

import InfobarWidget from './InfobarWidget'
import Search from '../Search'

export default class TicketInfobar extends React.Component {
    render() {
        const { ticket, widgets } = this.props
        if (!ticket || !widgets.get('items').length) {
            return null
        }

        const items = List(widgets.get('items'))
        const topWidgets = items.filter(w => w.type === 'top').sortBy(w => w.order)
        const bottomWidgets = items.filter(w => w.type === 'bottom').sortBy(w => w.order)
        const contentWidgets = items.filter(w => ['top', 'bottom'].indexOf(w.type) === -1).sortBy(w => w.order)

        const renderWidgets = (widgetList) => {
            return widgetList.map(w => {
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
                    return object.map((o, i) => {
                        return (
                            <InfobarWidget
                                key={i}
                                object={o}
                                widget={w}
                            />
                        )
                    })
                } else {
                    return (
                        <InfobarWidget
                            key={w.id}
                            object={object}
                            widget={w}
                        />
                    )
                }
            })
        }

        return (
            <div className="infobar">
                <div className="infobar-top infobar-box infobar-search">
                    <Search id="ticket"/>
                </div>
                <div className="infobar-top infobar-box">
                    <h2>{ticket.get('requester').name}</h2>
                    {renderWidgets(topWidgets)}
                </div>
                <div className="infobar-content infobar-box">
                    {renderWidgets(contentWidgets)}
                </div>
                <div className="infobar-bottom infobar-box">
                    {renderWidgets(bottomWidgets)}
                </div>
            </div>
        )
    }
}

TicketInfobar.propTypes = {
    widgets: PropTypes.object,
    ticket: PropTypes.object
}
