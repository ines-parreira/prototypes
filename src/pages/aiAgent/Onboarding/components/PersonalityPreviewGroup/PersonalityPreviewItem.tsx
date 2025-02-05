import {Skeleton} from '@gorgias/merchant-ui-kit'
import cn from 'classnames'
import React from 'react'

import {Card, CardContent} from 'pages/aiAgent/Onboarding/components/Card'

import {mixedPreviews} from './constants'
import css from './PersonalityPreviewItem.less'

type Props = {
    title: string
    caption: string
    onSelect: () => void
    isSelected: boolean
    indexInGroup?: number
    isLoading?: boolean
}

// To have different skeleton sizes for each preview item,
// we rely on the mixedPreviews array to get the title and caption length
const getTitleSkeletongSize = (indexInGroup: number) => {
    return mixedPreviews[indexInGroup].title.length * 10
}
const getCaptionSkeletongSize = (indexInGroup: number) => {
    return mixedPreviews[indexInGroup].caption.length * 6
}

export const PersonalityPreviewItem: React.FC<Props> = ({
    title,
    caption,
    onSelect,
    isSelected,
    indexInGroup,
    isLoading,
}) => {
    let ariaLoadingProps: Record<string, string> = {}
    if (isLoading) {
        ariaLoadingProps = {'aria-busy': 'true', 'aria-live': 'polite'}
    }

    return (
        <Card
            className={cn(
                {[css.selected]: isSelected, [css.isLoading]: isLoading},
                css.card
            )}
            role="radio"
            aria-checked={isSelected}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === ' ') {
                    onSelect()
                    e.preventDefault()
                }
            }}
            tabIndex={0}
            {...ariaLoadingProps}
        >
            <CardContent className={css.content}>
                {isLoading && (
                    <div className={css.loader}>
                        <Skeleton
                            count={1}
                            width={getTitleSkeletongSize(indexInGroup ?? 0)}
                        />
                        <Skeleton
                            count={1}
                            width={getCaptionSkeletongSize(indexInGroup ?? 0)}
                            height={14}
                        />
                    </div>
                )}
                <div className={css.container}>
                    <div>
                        <h3 className={css.title}>{title}</h3>
                        <p>{caption}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
