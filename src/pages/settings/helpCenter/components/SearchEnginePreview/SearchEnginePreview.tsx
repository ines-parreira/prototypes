import React, {FC} from 'react'
import {FormText} from 'reactstrap'

import css from './SearchEnginePreview.less'

type Props = {
    title: string
    description: string
    baseUrl: string
    urlItems?: string[]
    help?: string
}

export const SearchEnginePreview: FC<Props> = ({
    title,
    description,
    baseUrl,
    urlItems = [],
    help,
}: Props) => (
    <div className={css.container}>
        <div className={css.label}>Search Engine Preview</div>
        <div className={css.preview}>
            <div className={css.url}>
                {baseUrl}
                {urlItems.map((item, index) => (
                    <span
                        key={`${item}-${index.toString()}`}
                        className={css['url-item']}
                    >
                        &nbsp;›&nbsp;{item}
                    </span>
                ))}
            </div>
            <div className={css.title}>{title}</div>
            <div className={css.description}>{description}</div>
        </div>
        {help && <FormText color="muted">{help}</FormText>}
    </div>
)
