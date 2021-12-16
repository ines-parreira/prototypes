import React from 'react'

import {LocalNavigationLink} from '../../../../../models/helpCenter/types'
import {LinkList, LinkItemEventHandlers} from '../LinkList'

import css from './NavSection.less'

type Props = {
    description: string
    items: LocalNavigationLink[]
    name: string
    title: string
    onChangeLink: LinkItemEventHandlers['onChange']
    onClickAdd: () => void
    onClickRemove: LinkItemEventHandlers['onDelete']
}

export const NavSection: React.FC<Props> = ({
    description,
    items,
    name,
    title,
    onChangeLink,
    onClickAdd,
    onClickRemove,
}: Props) => (
    <section>
        <div className={css.heading}>
            <div>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>

        <h4>Links</h4>
        <LinkList
            name={name}
            titlePlaceholder="Link title"
            urlPlaceholder="Link URL"
            list={items.map((item) => ({
                id: item.id,
                key: item.key,
                value: item.value,
                label: item.label,
            }))}
            onChange={onChangeLink}
            onDelete={onClickRemove}
            onAddNew={onClickAdd}
        />
    </section>
)
