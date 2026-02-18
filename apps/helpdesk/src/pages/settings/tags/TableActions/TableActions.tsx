import { useMemo } from 'react'

import { humanizeArray } from '@repo/utils'
import type { List } from 'immutable'

import type { Tag } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import { getTags } from 'state/tags/selectors'

import BulkDeleteButton from './BulkDeleteButton'
import MergeButton from './MergeButton'

import css from './TableActions.less'

type Props = {
    onMerge: () => void
    onBulkDelete: () => void
    selectedTagsIds: List<any>
}

const TableActions = ({ onBulkDelete, onMerge, selectedTagsIds }: Props) => {
    const tags = useAppSelector(getTags)
    const keyedTags = useMemo(
        () =>
            Object.assign(
                {},
                ...(tags.toJS() as Tag[]).map(
                    (tag) => ({ [tag.id]: tag }) as Record<number, Tag>,
                ),
            ) as Record<number, Tag>,
        [tags],
    )

    const selectedTagsNames = useMemo(
        () =>
            (
                selectedTagsIds
                    .map((id: number) => keyedTags[id]?.name)
                    .toJS() as string[]
            ).filter(Boolean),

        [keyedTags, selectedTagsIds],
    )

    const selectedTagText = useMemo(
        () => humanizeArray(selectedTagsNames),
        [selectedTagsNames],
    )

    return (
        <div className={css.actions}>
            <MergeButton
                onMerge={onMerge}
                selectedTagsIds={selectedTagsIds}
                tags={keyedTags}
                selectedTagsText={humanizeArray(selectedTagsNames.slice(0, -1))}
            />
            <BulkDeleteButton
                onBulkDelete={onBulkDelete}
                selectedTagsText={selectedTagText}
                selectedTagsCount={selectedTagsNames.length}
            />
        </div>
    )
}

export default TableActions
