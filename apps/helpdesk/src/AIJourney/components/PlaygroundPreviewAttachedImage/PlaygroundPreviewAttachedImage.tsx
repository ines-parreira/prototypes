import { Box } from '@gorgias/axiom'

import css from './PlaygroundPreviewAttachedImage.less'

export const PlaygroundPreviewAttachedImage = ({
    src,
    alt,
}: {
    src: string
    alt: string
}) => {
    return (
        <Box className={css.attachedImage}>
            <img src={src} alt={alt ?? 'selected-product-image'} />
        </Box>
    )
}
