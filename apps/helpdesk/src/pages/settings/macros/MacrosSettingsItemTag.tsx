import { Badge, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import TicketTag from 'pages/common/components/TicketTag'

import css from './MacrosSettingsItem.less'

type Props = {
    id: string
    tags?: string[]
}

export function MacrosSettingsItemTag({ id, tags }: Props) {
    return !!tags?.length ? (
        <div className={css.tags} id={id}>
            <TicketTag text={tags[0]} />
            {tags.length > 1 && (
                <>
                    <Tooltip target={id}>{tags.join(', ')}</Tooltip>
                    <Badge type={'light-dark'} corner="square">
                        +{tags.length - 1}
                    </Badge>
                </>
            )}
        </div>
    ) : (
        <>-</>
    )
}
