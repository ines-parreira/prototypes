// @flow
import React from 'react'
import type {Node} from 'react'
import type {Map} from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'


export default () => {
    return {
        TitleWrapper, // eslint-disable-line
    }
}

type Props = {
    children: ?Node,
    source: Map<*,*>
}

export class TitleWrapper extends React.Component<Props> { // eslint-disable-line
    // todo(@martin): type the context with `flow` when it's supported
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source} = this.props
        const {integration} = this.context
        const storeName = integration.getIn(['meta', 'store_name'])
        const customerHash = source.get('hash')

        return (
            <a
                href={`https://${storeName}.myshopify.com/tools/recurring/customers/${customerHash}/`}
                target="_blank"
            >
                {children}
            </a>
        )
    }
}
