import React, {ContextType, ReactNode} from 'react'
import type {Map} from 'immutable'

import logo from 'assets/img/infobar/magento.svg'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import StaticField from 'Widgets/modules/Template/modules/Field/components/StaticField'
import {CardHeaderTitle} from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderTitle'
import {CardHeaderIcon} from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderIcon'
import ExpandAllButton from 'Widgets/modules/Template/modules/Card/components/views/ExpandAllButton'
import {CardHeaderSubtitle} from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderSubtitle'

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
                <StaticField label="Created">
                    <DatetimeLabel
                        key="created-at"
                        dateTime={source.get('created_at')}
                    />
                </StaticField>
            </>
        )
    }
}

type TitleWrapperProps = {
    children: ReactNode
    source: Map<string, any>
    isEditing: boolean
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    static contextType = IntegrationContext
    context!: ContextType<typeof IntegrationContext>
    render() {
        const {children, source, isEditing} = this.props

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
                {!isEditing && <ExpandAllButton />}
                <CardHeaderTitle>
                    <CardHeaderIcon src={logo} alt="Magento" />
                    Magento
                    <CardHeaderSubtitle>
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    </CardHeaderSubtitle>
                </CardHeaderTitle>
            </>
        )
    }
}
