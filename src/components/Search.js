import React from 'react'

export default class Search extends React.Component {
    render() {
        return (
            <div className="ui search">
                <div className="ui icon input">
                    <input className="prompt" type="text" placeholder="Search..."/>
                    <i className="search icon"></i>
                </div>
                <div className="results"></div>
            </div>
        )
    }
}