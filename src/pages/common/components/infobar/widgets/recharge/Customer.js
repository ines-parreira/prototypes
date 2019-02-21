// @flow
import React, {type Node} from 'react'
import type {Map} from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'

import {renderTemplate} from '../../../../utils/template'


export default function Customer() {
    return {
        TitleWrapper,
    }
}

type Props = {
    children: ?Node,
    source: Map<*,*>,
    template: Map<*,*>
}

export class TitleWrapper extends React.Component<Props> {
    // todo(@martin): type the context with `flow` when it's supported
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source, template} = this.props
        const {integration} = this.context
        const storeName = integration.getIn(['meta', 'store_name'])
        const customerHash = source.get('hash')

        const defaultLink = `https://${storeName}.myshopify.com/tools/recurring/customers/${customerHash}/`
        let customLink = template.getIn(['meta', 'link'])

        if (customLink) {
            customLink = renderTemplate(customLink, source.set('customerHash', customerHash).toJS())
        }

        return (
            <a
                href={customLink || defaultLink}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        )
    }
}
