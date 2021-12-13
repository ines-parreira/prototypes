import React, {ReactNode} from 'react'
import {Map} from 'immutable'

import logo from 'assets/img/infobar/chat.svg'

import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import {renderTemplate} from '../../../../../../../utils/template'

export default function Root() {
    return {
        TitleWrapper,
    }
}

type Props = {
    children: ReactNode
    source: Map<any, any>
    template: Map<any, any>
}

export function TitleWrapper({children, source, template}: Props) {
    const link = template.getIn(['meta', 'link'])
    return (
        <>
            <CardHeaderIcon src={logo} alt="Chat" />
            <CardHeaderTitle>
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
            </CardHeaderTitle>
        </>
    )
}
