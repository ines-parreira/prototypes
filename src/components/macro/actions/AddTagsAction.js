import React, {PropTypes} from 'react'
import TicketTags from './../../ticket/ticketview/ticketdetails/TicketTags'

export default class AddTagsAction extends React.Component {
    addTags(tags) {
        let newTags = this.props.action.get('arguments')
        newTags = newTags.concat(tags)
        this.props.updateActionArgs(this.props.index, newTags)
    }

    removeTag(tagIndex) {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments').delete(tagIndex)
        )
    }

    render() {
        const {action, tags, deleteAction, index} = this.props

        return (
            <div className="tags">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(action.get('id'))}
                />
                <h4>ADD TAGS</h4>
                <TicketTags
                    tags={tags.toJS()}
                    ticketTags={action.get('arguments')}
                    addTag={value => this.addTags(value)}
                    removeTag={tagIndex => this.removeTag(tagIndex)}
                    suffix={`macro-modal-${index}`}
                />
                <div className="ui divider"></div>
            </div>
        )
    }
}

AddTagsAction.propTypes = {
    action: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
