import {fromJS, Map, List} from 'immutable'
import _capitalize from 'lodash/capitalize'
import React from 'react'
import {Button} from 'reactstrap'

import * as viewsConfig from 'config/views'
import {humanizeString} from 'utils'

type Props = {
    view: Map<any, any>
    objectPath: string
}

export default function Left({objectPath, view}: Props) {
    // just remove the first object name. Ex: ticket.customer.id ==> customer.id
    const suffixPath = objectPath.split('.').slice(1).join('.')

    // now find our field and return it's title
    const field = (
        viewsConfig
            .getConfigByType(view.get('type'))
            .get('fields', fromJS([])) as List<any>
    ).find((f: Map<any, any>) => f.get('path') === suffixPath) as Map<any, any>

    return (
        <Button className="btn-frozen" tag="div" size="sm" color="primary">
            {field
                ? field.get('title')
                : _capitalize(humanizeString(suffixPath))}
        </Button>
    )
}
