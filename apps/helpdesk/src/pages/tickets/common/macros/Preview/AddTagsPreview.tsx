import cn from 'classnames'

import { MacroAction } from '@gorgias/helpdesk-types'

import TicketTag from 'pages/common/components/TicketTag'

import css from './Preview.less'

export const AddTagsPreview = ({
    addTagsAction,
}: {
    addTagsAction?: MacroAction
}) => {
    if (!addTagsAction) return null

    return (
        <div className={cn(css.macroData, css.addTagWrapper)}>
            <strong className="text-muted">Add tags:</strong>
            {(addTagsAction.arguments.tags as string).split(',').map((tag) => (
                <TicketTag text={tag} key={tag} />
            ))}
        </div>
    )
}
