import React, { PropTypes } from 'react'
import classnames from 'classnames'


export default class Read extends React.Component {
    render() {
        const { hidden, actions, ticketTags, toggle } = this.props
        return (
            <div className={classnames({ hidden })}>

                {
                    ticketTags.map((tag, i) => (
                            <div key={tag.get('id')} className="ticket-tag ui label">
                                {tag.get('name')}
                                <i className="icon close" onClick={() => actions.ticket.removeTag(i)}/>
                            </div>
                        )
                    )
                }

                <button className="ticket-tag-add-btn ui button" onClick={toggle}>
                    <i className="icon plus" />
                    ADD TAG
                </button>

            </div>
        )
    }
}


Read.propTypes = {
    actions: PropTypes.object.isRequired,
    ticketTags: PropTypes.object.isRequired,
    hidden: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
}
