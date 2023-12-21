import React from 'react'

import Button from 'pages/common/components/button/Button'

import Tooltip from '../../../../common/components/Tooltip'

import {LinkItem, LinkEntity, LinkItemEventHandlers} from './LinkItem'

import css from './LinkList.less'

type Props = LinkItemEventHandlers & {
    list: LinkEntity[]
    limit?: number
    name: string
    titlePlaceholder?: string
    urlPlaceholder?: string
    onAddNew?: () => void
}

export const LinkList = ({
    list,
    limit = 5,
    name,
    titlePlaceholder,
    urlPlaceholder,
    onAddNew,
    onChange,
    onDelete,
}: Props): JSX.Element => {
    const isLimitExceeded = list.length >= limit

    return (
        <div>
            {list.length > 0 && (
                <div className={css['link-list']}>
                    <div className={css['link-list-header']}>
                        <span>Title</span>
                        <span>URL</span>
                    </div>
                    {list.map((item) => (
                        <LinkItem
                            key={item.key}
                            id={item.id}
                            label={item.label}
                            titlePlaceholder={titlePlaceholder}
                            value={item.value}
                            urlPlaceholder={urlPlaceholder}
                            onChange={onChange}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
            <span id={`help-${name}`}>
                <Button
                    className={css['add-link']}
                    isDisabled={isLimitExceeded}
                    intent="secondary"
                    style={isLimitExceeded ? {pointerEvents: 'none'} : {}}
                    onClick={onAddNew}
                >
                    <i className="material-icons">add</i>
                    Add Nav Item
                </Button>
            </span>
            {isLimitExceeded && (
                <Tooltip
                    target={`help-${name}`}
                    placement="top-start"
                    style={{width: 180, textAlign: 'left'}}
                >
                    {`The maximum number of links is ${limit}`}
                </Tooltip>
            )}
        </div>
    )
}
