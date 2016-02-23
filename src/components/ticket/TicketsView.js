import React, {PropTypes} from 'react'
import TicketTable from './TicketTable'
import Search from '../Search'


export default class TicketsView extends React.Component {
    getInfiniteScrollHeight() {
        // This is hacky and not re-useable but for now I'd like to contain infinite-scroll stuff
        // to one small, easy-to-understand spot rather than re-wiring the App > DashBoard > Container > View
        // layout structure with CSS magic
        const appHeight = document.getElementById('App').clientHeight
        const fromTop = 200
        const fromBottom = 20
        return appHeight - fromTop - fromBottom
    }

    render() {
        return (
            <div className="TicketsView">
                <div className="ui text menu">
                    <a className="ui dropdown item">
                        <i className="columns icon"/>
                        Show more fields

                        <div className="menu">
                            <div className="item">
                                <div className="ui checkbox">
                                    <label>
                                        <input type="checkbox"/>
                                        Ticket: Last updated date
                                    </label>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ui checkbox">
                                    <label>
                                        <input type="checkbox" />
                                        Ticket: Checked
                                    </label>
                                </div>
                            </div>
                        </div>
                    </a>
                    <div className="right menu item">
                        <div className="item">
                            <Search />
                        </div>
                    </div>
                </div>

                <h1 className="ui header">{this.props.view.name}</h1>
                <TicketTable
                    items={this.props.items}
                    currentUser={this.props.currentUser}
                    pushState={this.props.pushState}
                    onInfiniteLoad={this.props.onInfiniteLoad}
                    isLoading={this.props.isLoading}
                    infiniteScrollHeight={this.getInfiniteScrollHeight()}
                />
            </div>
        )
    }
}

TicketsView.propTypes = {
    currentUser: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired,
    onInfiniteLoad: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    view: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
}
