import React from 'react'

export default class Sidebar extends React.Component {
    render() {
        return (
            <div className="ui inverted blue left visible vertical sidebar large menu">
                <div className="header active dropdown item">
                    Tickets
                    <i className="dropdown icon"></i>
                </div>
                <div className="item">
                    <div className="header">FAVORITES</div>
                    <div className="menu">
                        <a className="item">Tech issues (2)</a>
                        <a className="item">Unsolved &gt;24h (20)</a>
                    </div>
                </div>

                <div className="item">
                    <div className="header">SHARED VIEWS (9)</div>
                    <div className="menu">
                        <a className="item">My tickets (12)</a>
                        <a className="item">New tickets (102)</a>
                        <a className="item">Open tickets (22)</a>
                        <a className="item">Closed tickets</a>
                    </div>
                </div>

                <div className="item">
                    <div className="header">MY VIEWS</div>
                    <div className="menu">
                        <a className="item">My tickets (12)</a>
                        <a className="item">New tickets (102)</a>
                        <a className="item">Open tickets (22)</a>
                        <a className="item">Closed tickets</a>
                    </div>
                </div>

                <a className="ui bound bottom sticky active item">
                    Avi Davis
                    <i className="ellipsis horizontal icon"></i>
                </a>
            </div>
        )
    }
}
