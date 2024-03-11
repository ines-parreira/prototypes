import React, {Component, ReactNode} from 'react'
import {Map} from 'immutable'

import logo from 'assets/img/infobar/smile.svg'

import {renderTemplate} from 'pages/common/utils/template'
import {CardHeaderTitle} from 'Infobar/features/Card/display/CardHeaderTitle'
import {CardHeaderIcon} from 'Infobar/features/Card/display/CardHeaderIcon'
import {CardHeaderSubtitle} from 'Infobar/features/Card/display/CardHeaderSubtitle'

export default function Customer() {
    return {
        TitleWrapper,
    }
}

type Props = {
    children: ReactNode
    source: Map<any, any>
    template: Map<any, any>
}

export class TitleWrapper extends Component<Props> {
    render() {
        const {children, source, template} = this.props
        const customerHash = source.get('hash')
        let link = template.getIn(['meta', 'link'])

        if (link) {
            link = renderTemplate(
                link,
                source.set('customerHash', customerHash).toJS()
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
