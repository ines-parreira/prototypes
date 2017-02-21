import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import * as viewsSelectors from '../../../../../state/views/selectors'

const Left = ({view, objectPath}) => {
    // just remove the first object name. Ex: ticket.requester.id ==> requester.id
    const suffixPath = objectPath.split('.').slice(1).join('.')
    // now find our field and return it's title
    const field = viewsSelectors.getViewConfigByType(view.get('type'))
        .get('fields', fromJS([]))
        .find(f => f.get('path') === suffixPath)
    return <span className="ui basic light blue item button">{field ? field.get('title') : suffixPath}</span>
}

Left.propTypes = {
    view: PropTypes.object.isRequired,
    objectPath: PropTypes.string.isRequired
}

export default Left
