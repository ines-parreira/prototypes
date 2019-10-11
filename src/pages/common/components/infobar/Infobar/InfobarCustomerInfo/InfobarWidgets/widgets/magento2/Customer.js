// @flow
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

export default function Customer() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper, // eslint-disable-line,
    }
}


type TitleWrapperProps = {
    children: Object,
    source: Map<string,*>
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source} = this.props

        const storeUrl: string = this.context.integration.getIn(['meta', 'store_url'])
        const adminUrlSuffix: string = this.context.integration.getIn(['meta', 'admin_url_suffix'])
        const customerId = (source.get('id') || '').toString()

        const link = `https://${storeUrl}/${adminUrlSuffix}/customer/index/edit/id/${customerId}/`

        if (!adminUrlSuffix) {
            return children
        }

        return (
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        )
    }
}
