// @flow
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import type {Map} from 'immutable'

import logo from '../../../../../../../../../../img/infobar/magento.svg'
import {DatetimeLabel} from '../../../../../../../utils/labels'
import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderValue} from '../CardHeaderValue'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import ExpandAllButton from '../ExpandAllButton'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'

export default function Customer() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper,
        AfterTitle,
    }
}

type AfterTitleProps = {
    source: Map<string, *>,
}

class AfterTitle extends React.Component<AfterTitleProps> {
    render() {
        const {source} = this.props

        return (
            <>
                <CardHeaderDetails>
                    <CardHeaderValue label="Created">
                        <DatetimeLabel
                            key="created-at"
                            dateTime={source.get('created_at')}
                        />
                    </CardHeaderValue>
                </CardHeaderDetails>
            </>
        )
    }
}

type TitleWrapperProps = {
    children: Object,
    source: Map<string, *>
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
            <>
                <CardHeaderIcon
                    src={logo}
                    alt="Magento"
                />
                <CardHeaderTitle>Magento</CardHeaderTitle>
                <CardHeaderSubtitle>
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                    </a>
                </CardHeaderSubtitle>
                <ExpandAllButton/>
            </>
        )
    }
}
