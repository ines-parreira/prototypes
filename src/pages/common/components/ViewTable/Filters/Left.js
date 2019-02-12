import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import {Button, } from 'reactstrap'
import _capitalize from 'lodash/capitalize'

import {humanizeString} from '../../../../../utils'

import * as viewsConfig from '../../../../../config/views'

export default class Left extends React.Component {
    static propTypes = {
        view: PropTypes.object.isRequired,
        objectPath: PropTypes.string.isRequired
    }

    render() {
        const {view, objectPath} = this.props

        // just remove the first object name. Ex: ticket.customer.id ==> customer.id
        const suffixPath = objectPath.split('.').slice(1).join('.')

        // now find our field and return it's title
        const field = viewsConfig.getConfigByType(view.get('type'))
            .get('fields', fromJS([]))
            .find((f) => f.get('path') === suffixPath)

        return (
            <Button
                className="btn-frozen"
                tag="div"
                size="sm"
                color="primary"
            >
                {field ? field.get('title') : _capitalize(humanizeString(suffixPath))}
            </Button>
        )
    }
}

