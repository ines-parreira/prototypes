import React, {PropTypes} from 'react'
import _ from 'lodash'

export default class TicketTags extends React.Component {
    render = () => {
        return (
            <div className="ui tiny labels">
                {
                    this.props.tags.map((tag) => {
                        // TODO: Make [x] actually remove tags
                        return (
                            <div key={tag.get('id')} className="ticket-tag ui teal horizontal label">
                                {tag.get('name')}
                                <i className="icon close" />
                            </div>
                        )
                    })
                }
                <a href="#">+ Add tag</a>
            </div>
        )
    }
}

TicketTags.propTypes = {
    tags: PropTypes.object.isRequired,
}
