import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {Button} from 'reactstrap'
import _capitalize from 'lodash/capitalize'

import {humanizeString} from '../../../../../utils'

import * as viewsSelectors from '../../../../../state/views/selectors'

export default class Left extends React.Component {
    static propTypes = {
        view: PropTypes.object.isRequired,
        objectPath: PropTypes.string.isRequired
    }

    render() {
        const {view, objectPath} = this.props

        // just remove the first object name. Ex: ticket.requester.id ==> requester.id
        const suffixPath = objectPath.split('.').slice(1).join('.')

        // now find our field and return it's title
        const field = viewsSelectors.getViewConfigByType(view.get('type'))
            .get('fields', fromJS([]))
            .find(f => f.get('path') === suffixPath)

        return (
            <Button
                className="btn-frozen"
                tag="div"
                color="info"
            >
                {field ? field.get('title') : _capitalize(humanizeString(suffixPath))}
            </Button>
        )
    }
}

