import React, {PropTypes} from 'react'
import _ from 'lodash'

export default class TicketTags extends React.Component {
    render = () => {
        return (
            <div className="ui labels">
                {
                    this.props.tags.map((tag) => {
                        // TODO: Make [x] actually remove tags
                        return (
                            <div key={tag.get('id')} className="ticket-tag ui label">
                                {tag.get('name')}
                                <i className="icon close" />
                            </div>
                        )
                    })
                }

                <button className="ticket-tag-add-btn ui button">
                    <i className="icon plus" />
                    ADD TAG
                </button>
            </div>
        )
    }
}

TicketTags.propTypes = {
    tags: PropTypes.object.isRequired,
}
