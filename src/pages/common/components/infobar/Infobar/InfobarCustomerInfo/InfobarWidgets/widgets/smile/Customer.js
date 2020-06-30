// @flow
import React, {type Node} from 'react'
import type {Map} from 'immutable'

import logo from '../../../../../../../../../../img/infobar/smile.svg'
import {renderTemplate} from '../../../../../../../utils/template'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'

export default function Customer() {
    return {
        TitleWrapper,
    }
}

type Props = {
    children: ?Node,
    source: Map<*, *>,
    template: Map<*, *>,
}

export class TitleWrapper extends React.Component<Props> {
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
