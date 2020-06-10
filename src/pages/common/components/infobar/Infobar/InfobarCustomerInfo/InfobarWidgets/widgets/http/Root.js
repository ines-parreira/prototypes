// @flow
import React, {type Node} from 'react'
import {type Map} from 'immutable'

import logo from '../../../../../../../../../../img/integrations/http.png'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import {renderTemplate} from '../../../../../../../utils/template'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'

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
            <CardHeaderIcon
                src={logo}
                alt="HTTP"
            />
            <CardHeaderTitle>HTTP</CardHeaderTitle>
            <CardHeaderSubtitle>
                {link
                    ? (
                        <a
                            href={renderTemplate(link, source.toJS())}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    )
                    : children
                }
            </CardHeaderSubtitle>
        </>
    )
}
