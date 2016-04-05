import React, { PropTypes } from 'react'

export default class Search extends React.Component {
    triggerSearch(id) {
        if (this.props.search) {
            this.props.search(document.getElementById(`search-${id}`).value)
        }
    }

    render() {
        const { id } = this.props

        return (
            <div className="ui search">
                <div className="ui small icon input">
                    <input
                        id={`search-${id}`}
                        className="prompt"
                        type="text"
                        placeholder="Search..."
                        onChange={() => this.triggerSearch(id)}
                    />
                    <i className="search icon"/>
                </div>
                <div className="results"></div>
            </div>
        )
    }
}

Search.propTypes = {
    id: PropTypes.string.isRequired,
    search: PropTypes.func
}
