import React from 'react'

export default class Sidebar extends React.Component {
    render() {
        return (
            <div className="ui inverted blue left visible vertical sidebar large menu">
                <div className="header active dropdown item">
                    Rules
                    <i className="dropdown icon"></i>
                </div>

                <div className="item">
                    <div className="header">SHARED VIEWS (9)</div>
                    <div className="menu">
                        <a className="item">My rules (12)</a>
                        <a className="item">All rules (112)</a>
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
