import React from 'react'

export default class Search extends React.Component {
    render() {
        return (
            <div className="ui  search">
                <div className="ui six icon input">
                    <input id="user-search" className="prompt" type="text" placeholder="Search..."/>
                    <i className="search icon"></i>
                </div>
                <div className="results"></div>
            </div>
        )
    }
}