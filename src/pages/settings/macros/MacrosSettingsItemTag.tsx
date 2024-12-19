import {Tooltip} from '@gorgias/merchant-ui-kit'
import React from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge'
import TicketTag from 'pages/common/components/TicketTag'

import css from './MacrosSettingsList.less'

type Props = {
    id: string
    tags?: string[]
}

export function MacrosSettingsItemTag({id, tags}: Props) {
    return !!tags?.length ? (
        <div className={css.tags} id={id}>
            <TicketTag text={tags[0]} />
            {tags.length > 1 && (
                <>
                    <Tooltip target={id}>{tags.join(', ')}</Tooltip>
                    <Badge type={ColorType.LightDark} corner="square">
                        +{tags.length - 1}
                    </Badge>
                </>
            )}
        </div>
    ) : (
        <>-</>
    )
}
