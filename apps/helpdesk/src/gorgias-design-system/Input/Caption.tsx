import type { HTMLAttributes } from 'react'
import type React from 'react'

import styled from '@emotion/styled'

import { gorgiasColors } from 'gorgias-design-system/styles'

export interface CaptionProps {
    /**
     * Whether the field is valid or not.
     */
    isValid?: boolean
}

export const StyledCaption = styled.div<CaptionProps>`
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
    color: var(--caption-color, ${gorgiasColors.neutralGrey5});

    &&[data-invalid='true'] {
        color: var(--caption-color-invalid, ${gorgiasColors.secondaryRed});
    }
`

/**
 * A component to display additional information about a field.
 */
export const Caption: React.FC<
    HTMLAttributes<HTMLDivElement> & CaptionProps
> = ({ isValid, children, ...props }) => {
    return (
        <StyledCaption data-invalid={!isValid} {...props}>
            {children}
        </StyledCaption>
    )
}

export default Caption
