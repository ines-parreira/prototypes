import React, {Component} from 'react'

export default class NoMatch extends Component {
    render() {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{height: '100%'}}
            >
                <h1>
                    <i className="material-icons">search</i>
                </h1>
                <h1>Error! That page was not found :(</h1>
            </div>
        )
    }
}
