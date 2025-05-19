import { List, Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { MacroAction } from 'models/macroAction/types'
import TicketTag from 'pages/common/components/TicketTag'
import { getTags } from 'state/tags/selectors'

import { BaseActionPreview } from './BaseActionPreview'

type Props = {
    action: MacroAction
}

export const TagActionPreview = ({ action }: Props) => {
    const tags = action.arguments.tags?.split(',') || []
    const tagStore = useAppSelector<List<any>>(getTags)

    if (!tags.length) {
        return null
    }

    const TicketTags = tags.map((tag) => {
        const tagObject: Map<any, any> = tagStore.find(
            (tagObject: Map<any, any>) => tagObject.get('name') === tag,
        )

        return (
            <TicketTag
                key={tag}
                text={tag}
                decoration={tagObject?.get('decoration')?.toJS()}
            />
        )
    })

    return (
        <BaseActionPreview actionName="Add tags">
            {TicketTags}
        </BaseActionPreview>
    )
}

export default TagActionPreview
