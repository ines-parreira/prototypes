import React, {ContextType, ReactNode} from 'react'
import type {Map} from 'immutable'

import logo from 'assets/img/infobar/magento.svg'

import {DatetimeLabel} from '../../../../../../../utils/labels'
import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderValue} from '../CardHeaderValue'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import ExpandAllButton from '../ExpandAllButton'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'
import {IntegrationContext} from '../IntegrationContext'

export default function Customer() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper,
        AfterTitle,
    }
}

type AfterTitleProps = {
    source: Map<string, any>
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
    children: ReactNode
    source: Map<string, any>
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    static contextType = IntegrationContext
    context!: ContextType<typeof IntegrationContext>
    render() {
        const {children, source} = this.props

        const storeUrl: string = this.context.integration.getIn([
            'meta',
            'store_url',
        ]) as string
        const adminUrlSuffix: string = this.context.integration.getIn([
            'meta',
            'admin_url_suffix',
        ]) as string
        const customerId = ((source.get('id') as string) || '').toString()

        const link = `https://${storeUrl}/${adminUrlSuffix}/customer/index/edit/id/${customerId}/`

        if (!adminUrlSuffix) {
            return children
        }

        return (
            <>
                <CardHeaderIcon src={logo} alt="Magento" />
                <CardHeaderTitle>Magento</CardHeaderTitle>
                <CardHeaderSubtitle>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        {children}
                    </a>
                </CardHeaderSubtitle>
                <ExpandAllButton />
            </>
        )
    }
}
