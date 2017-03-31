import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

export default () => {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper, // eslint-disable-line
    }
}

class TitleWrapper extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        source: ImmutablePropTypes.map.isRequired,
    }

    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source} = this.props
        const shopName = this.context.integration.getIn(['meta', 'shop_name'])

        return (
            <a
                href={`https://${shopName}.myshopify.com/admin/customers/${source.get('id')}`}
                target="_blank"
            >
                {children}
            </a>
        )
    }
}
