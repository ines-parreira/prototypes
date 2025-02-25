import React, {
    ChangeEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'

import styled from '@emotion/styled'

import { gorgiasColors } from 'gorgias-design-system/styles'

import Caption from './Caption'
import Label from './Label'

export interface TextAreaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
     * The label to display above the field.
     */
    label?: string
    /**
     * Whether the field is required.
     */
    required?: boolean
    /**
     * Floating label that provides additional context.
     */
    tooltip?: React.ReactNode
    /**
     * Whether the field is expandable. If false, the field will not be resizable and the expand icon will not be displayed on the bottom right corner.
     */
    isExpandable?: boolean
    /**
     * Whether the field is alternative. If true, the field will grow vertically as the user types until maxHeight is reached.
     */
    isAlternative?: boolean
    /**
     * The minimum height of the field.
     * @default 48
     */
    minHeight?: number
    /**
     * The maximum height of the field.
     */
    maxHeight?: number
}

type ValueType = string | ReadonlyArray<string> | number | undefined

const StyledTextAreaWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
`

const StyledTextArea = styled.textarea<TextAreaProps>`
    min-height: ${({ minHeight }) => `${minHeight!}px`};
    max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : '')};
    overflow-y: auto;
    width: 100%;
    border: 1px solid
        var(--textarea-border-color, ${gorgiasColors.neutralGrey3});
    border-radius: 4px;
    outline: none;
    padding: 12px;

    resize: ${({ isExpandable }) => (isExpandable ? 'vertical' : 'none')};

    font-size: 14px;
    color: var(--textarea-color, ${gorgiasColors.dark});
    background-color: var(--textarea-background-color, ${gorgiasColors.white});

    ${({ isAlternative }) =>
        isAlternative
            ? `
                --textarea-background-color: ${gorgiasColors.neutralGrey2};
                --textarea-border-color: ${gorgiasColors.neutralGrey2};
                --textarea-background-color-disabled: ${gorgiasColors.neutralGrey1};
                --textarea-border-color-disabled: ${gorgiasColors.neutralGrey1};
                --textarea-border-color-focus: ${gorgiasColors.neutralGrey2};
                border: 0;
            `
            : ''}

    ::placeholder {
        /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: var(--textarea-placeholder-color, ${gorgiasColors.neutralGrey4});
        opacity: 1; /* Firefox */
    }

    ::-ms-textarea-placeholder {
        /* Microsoft Edge */
        color: var(--textarea-placeholder-color, ${gorgiasColors.neutralGrey4});
    }

    &&:focus {
        box-shadow: none;
        border-color: var(
            --textarea-border-color-focus,
            ${gorgiasColors.supportingBlue9}
        );
    }

    &&:disabled {
        background-color: var(
            --textarea-background-color-disabled,
            ${gorgiasColors.neutralGrey2}
        );
        border-color: var(
            --textarea-border-color-disabled,
            ${gorgiasColors.neutralGrey3}
        );
        color: var(--textarea-color-disabled, ${gorgiasColors.neutralGrey4});
    }

    &&[aria-invalid='true'] {
        border-color: var(
            --textarea-border-color-error,
            ${gorgiasColors.secondaryRed}
        );
        box-shadow: none;
        background-image: none;
    }
`

/**
 * Form input that allows users to type information. Used for large information collection.
 */
const TextArea: React.FC<TextAreaProps> = (args) => {
    const {
        id,
        caption,
        disabled,
        isValid,
        label,
        required,
        tooltip,
        value,
        minHeight = 96,
        maxHeight,
        isExpandable = true,
        onChange,
    } = args

    const [innerValue, setInnerValue] = useState<ValueType>(value ?? '')
    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        triggerInnerValueChange(value)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    useEffect(() => {
        if (!textAreaRef.current || !maxHeight || !minHeight) {
            return
        }

        const padding = 12
        const textArea = textAreaRef.current
        textArea.style.height = `${minHeight}px`

        let adjustedScrollHeight = textArea.scrollHeight - 2 * padding

        if (adjustedScrollHeight > maxHeight) {
            adjustedScrollHeight = maxHeight
        }

        // Set the textarea height, accounting for the padding size
        textArea.style.height = `${adjustedScrollHeight + 2 * padding}px`
    }, [innerValue, maxHeight, minHeight])

    const triggerInnerValueChange = useCallback(
        (value) => {
            setInnerValue(value)
            onChange && onChange(value)
        },
        [setInnerValue, onChange],
    )

    const onTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        triggerInnerValueChange(event.target.value)
    }

    return (
        <StyledTextAreaWrapper>
            {label && (
                <Label
                    disabled={disabled}
                    htmlFor={id}
                    label={label}
                    required={required}
                    tooltip={tooltip}
                />
            )}
            <StyledTextArea
                {...args}
                ref={textAreaRef}
                name={id}
                value={innerValue}
                minHeight={minHeight}
                isExpandable={isExpandable}
                aria-invalid={!isValid}
                onChange={onTextAreaChange}
            />
            {caption && <Caption isValid={isValid}>{caption}</Caption>}
        </StyledTextAreaWrapper>
    )
}

export default TextArea
