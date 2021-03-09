import React, {ReactNode} from 'react'
import {Map} from 'immutable'

import logo from '../../../../../../../../../../img/integrations/http.png'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import {renderTemplate} from '../../../../../../../utils/template.js'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'

export default function Root() {
    return {
        TitleWrapper,
    }
}

type Props = {
    children: ReactNode
    source: Map<string, any>
    template: Map<string, any>
}

export function TitleWrapper({children, source, template}: Props) {
    const link = template.getIn(['meta', 'link']) as string

    return (
        <>
            <CardHeaderIcon src={logo} alt="HTTP" />
            <CardHeaderTitle>HTTP</CardHeaderTitle>
            <CardHeaderSubtitle>
                {link ? (
                    <a
                        href={renderTemplate(link, source.toJS())}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                    </a>
                ) : (
                    children
                )}
            </CardHeaderSubtitle>
        </>
    )
}
