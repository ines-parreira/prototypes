import React from 'react'
import {Button} from 'reactstrap'

import Tooltip from '../../../../common/components/Tooltip'

import {LinkItem, LinkEntity} from './LinkItem'

import css from './LinkList.less'

type Props = {
    list: LinkEntity[]
    limit?: number
    name: string
    titlePlaceholder?: string
    urlPlaceholder?: string
    onAddNew?: () => void
    onBlurInput: (
        ev: React.FocusEvent<HTMLInputElement>,
        key: string,
        id: number
    ) => void
    onDelete: (id: number) => void
}

export const LinkList = ({
    list,
    limit = 5,
    name,
    titlePlaceholder,
    urlPlaceholder,
    onAddNew,
    onBlurInput,
    onDelete,
}: Props) => {
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
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            titlePlaceholder={titlePlaceholder}
                            value={item.value}
                            urlPlaceholder={urlPlaceholder}
                            onBlur={onBlurInput}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
            <span id={`help-${name}`}>
                <Button
                    className={css['add-link']}
                    disabled={isLimitExceeded}
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
