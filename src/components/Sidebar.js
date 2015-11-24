import React from 'react'
import Link from 'react-router'

export default class Sidebar extends React.Component {
    render() {
        return (
            <div className="ui inverted blue left visible vertical sidebar large menu">
                <div className="ui header active dropdown item">
                    Tickets
                    <i className="chevron down icon"/>
                    <div className="menu">
                        <a className="item"><i className="edit icon"></i> Edit Profile</a>
                        <a className="item"><i className="globe icon"></i> Choose Language</a>
                        <a className="item"><i className="settings icon"></i> Account Settings</a>
                    </div>
                </div>

                <div className="item">
                    <div className="header">FAVORITES</div>
                    <div className="menu">
                        <a className="item">
                            Tech issues
                            <div className="ui teal label">10</div>
                        </a>
                        <a className="item">
                            Unsolved &gt;24h
                            <div className="ui red label">30</div>
                        </a>
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

                <a className="item bottom fixed">
                    Avi Davis <i className="ellipsis horizontal icon"></i>
                </a>
            </div>
    )
    }
    }
