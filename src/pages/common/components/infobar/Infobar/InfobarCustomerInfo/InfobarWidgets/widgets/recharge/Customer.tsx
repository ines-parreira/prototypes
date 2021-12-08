import React, {ReactNode} from 'react'
import {Map} from 'immutable'
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
    source: Map<any, any>
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
    children: ReactNode | null
    source: Map<any, any>
    template: Map<any, any>
}

export class TitleWrapper extends React.Component<TitleWrapperProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source, template} = this.props
        const {integration} = this.context as {integration: Map<any, any>}
        const storeName = integration.getIn(['meta', 'store_name']) as string
        const customerHash = source.get('hash') as string
        const defaultLink = `https://${storeName}-sp.admin.rechargeapps.com/admin/customers/${customerHash}/subscriptions/`
        let customLink = template.getIn(['meta', 'link']) as string | null

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
