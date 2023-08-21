/* eslint-disable @typescript-eslint/no-unused-vars */
import styled from '@emotion/styled'

import React from 'react'
import IconButton from 'gorgias-design-system/Buttons/IconButton'

import TextArea from './TextArea'

export interface ChatMessageInputProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /**
     * Placeholder text to display when the field is empty.
     */
    placeholder: string
    /**
     * The icon to display on the left side of the field.
     */
    leadIcon?: React.ReactNode
    /**
     * Whether the lead icon is disabled.
     */
    isLeadIconDisabled?: boolean
    /**
     * The aria-label to be used for the lead icon.
     */
    leadIconAriaLabel?: string
    /**
     * Function to be triggered when the lead icon is clicked.
     */
    onLeadIconClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
    /**
     * The icon to display on the right side of the field.
     */
    trailIcon: React.ReactNode
    /**
     * Whether the trail icon is disabled.
     */
    isTrailIconDisabled?: boolean
    /**
     * The aria-label to be used for the trail icon.
     */
    trailIconAriaLabel?: string
    /**
     * Function to be triggered when the trail icon is clicked.
     */
    onTrailIconClick?: (
        event: React.MouseEvent<HTMLElement, MouseEvent>
    ) => void
}

export const StyledChatMessageInputContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: end;
    gap: 4px;
`

/**
 *  Allows users to send messages in the Chat Widget.
 */
const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
    children,
    onTrailIconClick,
    onLeadIconClick,
    isTrailIconDisabled,
    isLeadIconDisabled,
    ...props
}) => {
    const {
        value,
        onChange,
        placeholder,
        leadIcon,
        leadIconAriaLabel,
        trailIcon,
        trailIconAriaLabel,
    } = props

    const handleOnChange = (value: unknown) => {
        onChange && onChange(value as React.ChangeEvent<HTMLTextAreaElement>)
    }

    return (
        <StyledChatMessageInputContainer>
            {leadIcon && (
                <IconButton
                    onClick={onLeadIconClick}
                    variant="primary"
                    fill="ghost"
                    icon={leadIcon}
                    disabled={isLeadIconDisabled}
                    aria-label={leadIconAriaLabel}
                />
            )}
            <TextArea
                {...props}
                id="chat-message-input"
                value={value}
                placeholder={placeholder}
                isExpandable={false}
                isValid
                isAlternative
                minHeight={44}
                maxHeight={180}
                onChange={handleOnChange}
            />
            {trailIcon && (
                <IconButton
                    onClick={onTrailIconClick}
                    variant="primary"
                    fill="ghost"
                    icon={trailIcon}
                    disabled={isTrailIconDisabled}
                    aria-label={trailIconAriaLabel}
                />
            )}
        </StyledChatMessageInputContainer>
    )
}

export default ChatMessageInput
