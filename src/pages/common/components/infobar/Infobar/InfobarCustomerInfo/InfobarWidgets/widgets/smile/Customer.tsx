import React, {Component, ReactNode} from 'react'
import {Map} from 'immutable'

import logo from '../../../../../../../../../../img/infobar/smile.svg'
import {renderTemplate} from '../../../../../../../utils/template.js'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'

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
                <CardHeaderIcon src={logo} alt="Smile" />
                <CardHeaderTitle>Smile</CardHeaderTitle>
                <CardHeaderSubtitle>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        {children}
                    </a>
                </CardHeaderSubtitle>
            </>
        )
    }
}
