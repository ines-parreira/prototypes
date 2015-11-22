import React from 'react'
import Head from './Head'
import Body from './Body'

const Table = React.createClass({
    render() {
        return (
            <table className="ui very basic selectable table">
                <Body rows={this.props.tickets} />
            </table>
        )
    }
})

export default Table