import { Component, type ContextType, type ReactNode } from 'react'

import type { Map } from 'immutable'

import logo from 'assets/img/infobar/magento.svg'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import type { CardCustomization } from 'Widgets/modules/Template/modules/Card/'
import { ExpandAllButton } from 'Widgets/modules/Template/modules/Card/'
import { CardHeaderIcon } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderIcon'
import { CardHeaderSubtitle } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderSubtitle'
import { CardHeaderTitle } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderTitle'
import { StaticField } from 'Widgets/modules/Template/modules/Field'

type AfterTitleProps = {
    source: Map<string, any>
}

class AfterTitle extends Component<AfterTitleProps> {
    render() {
        const { source } = this.props

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

class TitleWrapper extends Component<TitleWrapperProps> {
    static contextType = IntegrationContext
    declare context: ContextType<typeof IntegrationContext>
    render() {
        const { children, source, isEditing } = this.props

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

export const customerCustomization: CardCustomization = {
    editionHiddenFields: ['link'],
    TitleWrapper,
    AfterTitle,
}
