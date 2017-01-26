import React from 'react'
import { Link } from 'react-router'

export default class NoMatch extends React.Component {

    render() {
        return (
           <div>
                <h1 className="ui center aligned icon header">
                    <i className="find icon"></i>
                    <div className="content">
                        Error! That page was not found :(
                        <div className="sub header">Use the dropdown on the left to navigate to the page you want!</div>
                    </div>
                </h1>
           </div>
        )
    }
}
