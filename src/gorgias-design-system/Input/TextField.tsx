import React, {ChangeEvent, useCallback, useEffect, useState} from 'react'
import styled from '@emotion/styled'
import {gorgiasColors} from 'gorgias-design-system/styles'

import Label from './Label'
import Caption from './Caption'

export interface TextFieldProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * The id of the field.
     */
    id: string
    /**
     * The caption to display below the field.
     */
    caption?: string
    /**
     * Whether the field is valid.
     */
    isValid?: boolean
    /**
     * If true, the styling of the input changes.
     */
    isAlternative?: boolean
    /**
     * If true, the input will have a transparent background and prevents the user from interacting with it.
     */
    isFilled?: boolean
    /**
     * The label to display above the field.
     */
    label?: string
    /**
     * The icon to display on the left side of the field.
     */
    leadIcon?: React.ReactNode
    /**
     * Whether the field is required. It'll apply a visual marker on the label.
     */
    required?: boolean
    /**
     * Floating label that provides additional context.
     */
    tooltip?: React.ReactNode
    /**
     * The icon to display on the right side of the field.
     */
    trailIcon?: React.ReactNode
}

interface ExtendedTextFieldProps extends TextFieldProps {
    hasLeadIcon: boolean
    hasTrailIcon: boolean
}

interface IconProps {
    isLeadIcon: boolean
    disabled?: boolean
    isAlternative?: boolean
}

type ValueType = string | ReadonlyArray<string> | number | undefined

const StyledTextFieldWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
`

const StyledTextFieldContainer = styled.div`
    position: relative;
`
const StyledIcon = styled.div<IconProps>`
    position: absolute;
    top: 12px;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;

    svg > path {
        fill: var(--icon-fill, ${gorgiasColors.neutralGrey4});
    }

    ${({isAlternative}) => (isAlternative ? `top: 10px;` : '')}

    ${({isLeadIcon}) => (isLeadIcon ? `left: 12px;` : `right: 12px;`)}
`

const StyledTextField = styled.input<ExtendedTextFieldProps>`
    height: 48px;
    width: 100%;
    border: 1px solid
        var(--textfield-border-color, ${gorgiasColors.neutralGrey3});
    border-radius: 4px;
    outline: none;
    padding: 12px;

    font-size: 14px;
    color: var(--textfield-color, ${gorgiasColors.dark});
    background-color: var(--textfield-background-color, ${gorgiasColors.white});

    ${({hasLeadIcon}) => (hasLeadIcon ? `padding-left: 48px;` : ``)};
    ${({hasTrailIcon}) => (hasTrailIcon ? `padding-right: 48px;` : ``)};
    ${({isAlternative}) =>
        isAlternative
            ? `
                height: 44px;
                
                --textfield-background-color: ${gorgiasColors.neutralGrey2};
                --textfield-border-color: ${gorgiasColors.neutralGrey2};
                --textfield-background-color-disabled: ${gorgiasColors.neutralGrey1};
                --textfield-border-color-disabled: ${gorgiasColors.neutralGrey1};
                --textfield-border-color-focus: ${gorgiasColors.neutralGrey2};
                `
            : ''}
    ${({isFilled}) =>
        isFilled
            ? `
                &:not(:placeholder-shown):not(:focus){
                    background-color: transparent;
                    border-color: transparent;
                    padding-left: 0;
                    pointer-events: none;
                }
            `
            : ''}

    ::placeholder {
        /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: var(
            --textfield-placeholder-color,
            ${gorgiasColors.neutralGrey4}
        );
        opacity: 1; /* Firefox */
    }

    ::-ms-input-placeholder {
        /* Microsoft Edge */
        color: var(
            --textfield-placeholder-color,
            ${gorgiasColors.neutralGrey4}
        );
    }

    &&:focus {
        box-shadow: none;
        border-color: var(
            --textfield-border-color-focus,
            ${gorgiasColors.supportingBlue9}
        );
    }

    &&:disabled {
        background-color: var(
            --textfield-background-color-disabled,
            ${gorgiasColors.neutralGrey2}
        );
        border-color: var(
            --textfield-border-color-disabled,
            ${gorgiasColors.neutralGrey3}
        );
        color: var(--textfield-color-disabled, ${gorgiasColors.neutralGrey4});
    }

    &&[aria-invalid='true'] {
        border-color: var(
            --textfield-border-color-error,
            ${gorgiasColors.secondaryRed}
        );
        box-shadow: none;
        background-image: none;
    }
`

/**
 * Form input that allows users to type information. Used for short information collection.
 */
const TextField: React.FC<TextFieldProps> = ({...args}) => {
    const {
        caption,
        disabled,
        id,
        isValid,
        isAlternative,
        label,
        leadIcon,
        required,
        tooltip,
        trailIcon,
        value,
        onChange,
    } = args

    const [innerValue, setInnerValue] = useState<ValueType>(value ?? '')

    useEffect(() => {
        triggerInnerValueChange(value)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    const triggerInnerValueChange = useCallback(
        (value) => {
            setInnerValue(value)
            onChange && onChange(value)
        },
        [setInnerValue, onChange]
    )

    const onTextFieldChange = (ev: ChangeEvent<HTMLInputElement>) => {
        triggerInnerValueChange(ev.target.value)
    }

    return (
        <StyledTextFieldWrapper>
            {label && (
                <Label
                    disabled={disabled}
                    htmlFor={id}
                    label={label}
                    required={required}
                    tooltip={tooltip}
                />
            )}
            <StyledTextFieldContainer>
                {leadIcon && (
                    <StyledIcon
                        disabled={disabled}
                        isLeadIcon
                        isAlternative={isAlternative}
                    >
                        {leadIcon}
                    </StyledIcon>
                )}
                <StyledTextField
                    {...args}
                    name={id}
                    value={innerValue}
                    aria-invalid={!isValid}
                    onChange={onTextFieldChange}
                    hasLeadIcon={!!leadIcon}
                    hasTrailIcon={!!trailIcon}
                />
                {trailIcon && (
                    <StyledIcon
                        disabled={disabled}
                        isLeadIcon={false}
                        isAlternative={isAlternative}
                    >
                        {trailIcon}
                    </StyledIcon>
                )}
            </StyledTextFieldContainer>

            {caption && <Caption isValid={isValid}>{caption}</Caption>}
        </StyledTextFieldWrapper>
    )
}

export default TextField
