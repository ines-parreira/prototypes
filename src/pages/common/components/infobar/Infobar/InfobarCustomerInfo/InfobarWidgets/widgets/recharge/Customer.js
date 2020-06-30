// @flow
import React, {type Node} from 'react'
import type {Map} from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'

import logo from '../../../../../../../../../../img/infobar/recharge.svg'
import {renderTemplate} from '../../../../../../../utils/template'
import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderValue} from '../CardHeaderValue'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import ExpandAllButton from '../ExpandAllButton'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'

export default function Customer() {
    return {
        AfterTitle,
        TitleWrapper,
    }
}

type AfterTitleProps = {
    source: Map<*, *>,
}

function AfterTitle({source}: AfterTitleProps) {
    return (
        <>
            <CardHeaderDetails>
                <CardHeaderValue label="Status">
                    {source.get('status')}
                </CardHeaderValue>
            </CardHeaderDetails>
        </>
    )
}

type TitleWrapperProps = {
    children: ?Node,
    source: Map<*, *>,
    template: Map<*, *>,
}

export class TitleWrapper extends React.Component<TitleWrapperProps> {
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
            customLink = renderTemplate(
                customLink,
                source.set('customerHash', customerHash).toJS()
            )
        }

        return (
            <>
                <CardHeaderIcon src={logo} alt="Recharge" />
                <CardHeaderTitle>Recharge</CardHeaderTitle>
                <CardHeaderSubtitle>
                    <a
                        href={customLink || defaultLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                    </a>
                </CardHeaderSubtitle>
                <ExpandAllButton />
            </>
        )
    }
}
