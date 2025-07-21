import { getPreviewsForPreviewType, Preview, PreviewId } from './constants'
import { PersonalityPreviewItem } from './PersonalityPreviewItem'

import css from './PersonalityPreviewGroup.less'

type Props = {
    previewType?: 'mixed' | 'sales' | 'support'
    selectedPreviewId?: PreviewId
    onPreviewSelect: (preview: Preview) => void
    isLoading?: boolean
}

export const PersonalityPreviewGroup: React.FC<Props> = ({
    selectedPreviewId,
    onPreviewSelect,
    previewType = 'mixed',
    isLoading,
}) => {
    const previewsToDisplay = getPreviewsForPreviewType(previewType)
    let ariaLoadingProps: Record<string, string> = {}
    if (isLoading) {
        ariaLoadingProps = { 'aria-busy': 'true', 'aria-live': 'polite' }
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
                            !isLoading && selectedPreviewId === preview.id
                        }
                        onSelect={() => !isLoading && onPreviewSelect(preview)}
                        isLoading={isLoading}
                    />
                )
            })}
        </div>
    )
}
