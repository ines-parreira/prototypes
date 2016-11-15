import React, {PropTypes} from 'react'

const Left = ({view, objectPath}) => {
    // just remove the first object name. Ex: ticket.requester.id ==> requester.id
    const suffixPath = objectPath.split('.').slice(1).join('.')
    // now find our field and return it's title
    const field = view.get('fields').find(f => f.get('name') === suffixPath)
    return <span className="ui basic light blue item button">{field ? field.get('title') : suffixPath}</span>
}

Left.propTypes = {
    view: PropTypes.object.isRequired,
    objectPath: PropTypes.string.isRequired
}

export default Left
