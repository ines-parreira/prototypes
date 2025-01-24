import React from 'react'

import {getPreviewsForPreviewType, Preview} from './constants'
import css from './PersonalityPreviewGroup.less'
import {PersonalityPreviewItem} from './PersonalityPreviewItem'

type Props = {
    previewType?: 'mixed' | 'sales' | 'support'
    selectedPreviewIndex?: number
    onPreviewSelect: (preview: Preview, index: number) => void
    isLoading?: boolean
}

export const PersonalityPreviewGroup: React.FC<Props> = ({
    selectedPreviewIndex,
    onPreviewSelect,
    previewType = 'mixed',
    isLoading,
}) => {
    const previewsToDisplay = getPreviewsForPreviewType(previewType)
    let ariaLoadingProps: Record<string, string> = {}
    if (isLoading) {
        ariaLoadingProps = {'aria-busy': 'true', 'aria-live': 'polite'}
    }

    return (
        <div className={css.container} role="radiogroup" {...ariaLoadingProps}>
            {previewsToDisplay.map((preview, index) => {
                return (
                    <PersonalityPreviewItem
                        key={preview.title}
                        indexInGroup={index}
                        title={preview.title}
                        caption={preview.caption}
                        isSelected={
                            !isLoading && selectedPreviewIndex === index
                        }
                        onSelect={() =>
                            !isLoading && onPreviewSelect(preview, index)
                        }
                        isLoading={isLoading}
                    />
                )
            })}
        </div>
    )
}
