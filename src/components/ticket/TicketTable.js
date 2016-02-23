import React, {PropTypes} from 'react'
import moment from 'moment'
import 'moment-timezone'
import Infinite from 'react-infinite'
import TicketTableRow from './TicketTableRow'


export default class TicketTable extends React.Component {
    loadingSpinnerDelegate() {
        let noItems = this.props.items.length ? "" : "no-items"
        return this.props.isLoading ? <div className={`loading ${noItems}`}>Loading...</div> : null
    }

    render() {
        const elementHeight = 40

        return (
            <div className="TicketTable ui grid">
                <div className="row head-row">
                    <div className="one wide column">
                        <span className="ui checkbox">
                            <input type="checkbox"/>
                            <label></label>
                        </span>
                    </div>
                    <div className="ten wide column">Ticket Details</div>
                    <div className="three wide column">Created <i className="sort icon"></i></div>
                    <div className="two wide column">Channel <i className="sort icon"></i></div>
                </div>
                <Infinite
                    className="infinite-container"
                    elementHeight={elementHeight}
                    containerHeight={this.props.infiniteScrollHeight}
                    onInfiniteLoad={this.props.onInfiniteLoad}
                    isInfiniteLoading={this.props.isLoading}
                    infiniteLoadBeginEdgeOffset={50 * elementHeight}
                    loadingSpinnerDelegate={this.loadingSpinnerDelegate()}
                    >
                    {this.props.items.map((ticket) => {
                        return (
                            <TicketTableRow
                                key={ticket.id}
                                ticket={ticket}
                                currentUser={this.props.currentUser}
                                pushState={this.props.pushState} />
                        )
                    })}
                </Infinite>
            </div>
        )
    }
}

TicketTable.propTypes = {
    items: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired,
    onInfiniteLoad: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    infiniteScrollHeight: PropTypes.number.isRequired,
}
