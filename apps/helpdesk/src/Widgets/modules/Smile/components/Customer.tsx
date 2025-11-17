import type { ReactNode } from 'react'
import React, { Component } from 'react'

import type { Map } from 'immutable'

import logo from 'assets/img/infobar/smile.svg'
import { renderTemplate } from 'pages/common/utils/template'
import type { CardCustomization } from 'Widgets/modules/Template/modules/Card'
import { CardHeaderIcon } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderIcon'
import { CardHeaderSubtitle } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderSubtitle'
import { CardHeaderTitle } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderTitle'

type Props = {
    children: ReactNode
    source: Map<any, any>
    template: Map<any, any>
}

export class TitleWrapper extends Component<Props> {
    render() {
        const { children, source, template } = this.props
        const customerHash = source.get('hash')
        let link = template.getIn(['meta', 'link'])

        if (link) {
            link = renderTemplate(
                link,
                source.set('customerHash', customerHash).toJS(),
            )
        }

        return (
            <>
                <CardHeaderTitle>
                    <CardHeaderIcon src={logo} alt="Smile" />
                    Smile
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
    TitleWrapper,
}
