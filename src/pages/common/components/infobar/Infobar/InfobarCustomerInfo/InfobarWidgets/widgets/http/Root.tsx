import React, {ReactNode} from 'react'
import {Map} from 'immutable'

import logo from 'assets/img/integrations/http.png'
import {renderTemplate} from 'pages/common/utils/template'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import css from './Root.less'

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
    const pictureUrl = template.getIn(['meta', 'pictureUrl'], '') as string
    const color = template.getIn(['meta', 'color'], '') as string

    return (
        <>
            <CardHeaderTitle>
                {color && !pictureUrl ? (
                    <div
                        className={css.colorTile}
                        style={{
                            backgroundColor: color,
                        }}
                    />
                ) : (
                    <CardHeaderIcon
                        src={pictureUrl || logo}
                        alt={pictureUrl ? 'Widget Icon' : 'HTTP'}
                        color={color}
                    />
                )}
                {link ? (
                    <a
                        href={renderTemplate(link, source.toJS())}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                    </a>
                ) : (
                    children || 'HTTP'
                )}
            </CardHeaderTitle>
        </>
    )
}
