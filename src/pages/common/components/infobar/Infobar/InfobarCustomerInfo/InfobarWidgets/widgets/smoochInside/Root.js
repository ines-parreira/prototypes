// @flow
import React, {type Node} from 'react'
import {type Map} from 'immutable'

import logo from '../../../../../../../../../../img/infobar/chat.svg'
import {CardHeaderTitle} from '../CardHeaderTitle.tsx'
import {CardHeaderIcon} from '../CardHeaderIcon.tsx'
import {renderTemplate} from '../../../../../../../utils/template.ts'

export default function Root() {
    return {
        TitleWrapper,
    }
}

type Props = {
    children: Node,
    source: Map<string, *>,
    template: Map<string, *>,
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
