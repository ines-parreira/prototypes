import type { HTMLAttributes } from 'react'
import type React from 'react'

import styled from '@emotion/styled'

import { gorgiasColors } from 'gorgias-design-system/styles'

export interface LabelProps {
    id?: string
    /**
     * Whether the field is disabled on not.
     */
    disabled?: boolean
    /**
     * The ID of the input element the label belongs to.
     */
    htmlFor?: string
    /**
     * Descriptive text accompanying a field.
     */
    label: string
    /**
     * Boolean indicating if the field must be filled out. If true, a red asterisk appears next to the label.
     */
    required?: boolean
    /**
     * Floating label that provides additional context.
     */
    tooltip?: React.ReactNode
}

export const StyledLabel = styled.label`
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    color: var(--label-color, ${gorgiasColors.dark});
    margin-bottom: 0;
    gap: 4px;
    display: flex;
    align-items: center;

    .required {
        color: var(--label-required, ${gorgiasColors.secondaryRed});
    }

    .label-tooltip {
        margin-left: 6px;
    }

    &&[aria-disabled='true'] {
        color: var(--label-color-disabled, ${gorgiasColors.neutralGrey4});
    }
`

/**
 * A component to identify a field.
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Label />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export const Label: React.FC<HTMLAttributes<HTMLDivElement> & LabelProps> = ({
    id,
    disabled,
    htmlFor,
    label,
    required,
    tooltip,
    ...props
}: LabelProps) => {
    return (
        <StyledLabel
            id={id}
            htmlFor={htmlFor}
            aria-disabled={disabled}
            aria-label={label}
            {...props}
        >
            {label}
            {required && <span className="required">*</span>}
            {tooltip ?? null}
        </StyledLabel>
    )
}

export default Label
