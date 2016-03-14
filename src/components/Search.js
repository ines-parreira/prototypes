import React, {PropTypes} from 'react'

export default class Search extends React.Component {
    render() {
        const { id } = this.props

        return (
            <div className="ui  search">
                <div className="ui six icon input">
                    <input id={id} className="prompt" type="text" placeholder="Search..."/>
                    <i className="search icon"></i>
                </div>
                <div className="results"></div>
            </div>
        )
    }
}

Search.propTypes = {
    id: PropTypes.string.isRequired
}
