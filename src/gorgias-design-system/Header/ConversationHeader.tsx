/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {HTMLAttributes} from 'react'

import styled from '@emotion/styled'
import {gorgiasColors} from 'gorgias-design-system/styles'

export interface ConversationHeaderProps {
    /**
     * The title of the chat.
     */
    title: string
    /**
     * Display additional information in the conversation header.
     */
    message?: React.ReactNode
    /**
     * An icon that is placed before the chat title.
     */
    leadIcon?: React.ReactNode
    /**
     * A group of icons that are placed after the chat title.
     */
    trailIcons?: React.ReactNode
    /**
     * Whether the conversation header is expandable.
     */
    isExpandable?: boolean
    /**
     * The variant of the conversation header that defines the styling.
     */
    variant?: ConversationHeaderVariant
}

export type ConversationHeaderVariant = 'light' | 'dark' | 'offline'

const StyledConversationHeaderWrapper = styled.div<{
    variant: ConversationHeaderVariant
    backgroundImage?: string
}>`
    justify-content: center;
    flex-direction: column;
    color: ${({variant}) =>
        variant === 'light' ? gorgiasColors.white : gorgiasColors.dark};

    svg .withFill {
        fill: ${({variant}) =>
            variant === 'light' ? gorgiasColors.white : gorgiasColors.dark};
    }
`

const SlideWrapper = styled.div`
    border-top-left-radius: 10px;
    display: flex;
    justify-content: center;
    cursor: pointer;
    padding-top: 8px;
`

const CursorIcon = styled.div<{variant: ConversationHeaderVariant}>`
    height: 4px;
    width: 40px;
    background: ${({variant}) =>
        variant === 'light' ? gorgiasColors.white : gorgiasColors.dark};
    opacity: 0.5;
    border-radius: 10px;
`

const StyledConversationHeader = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    padding: 16px 8px;
`

const StyledHeaderInformation = styled.div`
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
`

const StyledTitle = styled.div<{isPlaceholder: boolean}>`
    font-size: 14px;
    font-weight: 600;

    ${({isPlaceholder}) => isPlaceholder && 'opacity: 0.3;'};
`

const StyledMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 400;
    opacity: 0.7;

    svg {
        width: 16px;
        height: 16px;
    }
`

const StyledTrailIcons = styled.div`
    display: flex;
    justify-content: center;
    margin-left: auto;
`

/**
 *  Can display chat title, introduction messages and reply time set by merchants, as well as high-level actions.
 */
const ConversationHeader: React.FC<
    HTMLAttributes<HTMLDivElement> & ConversationHeaderProps
> = ({children, ...props}) => {
    const {
        isExpandable,
        leadIcon,
        message,
        trailIcons,
        variant = 'light',
    } = props
    const title = props.title || 'Chat title'

    return (
        <StyledConversationHeaderWrapper variant={variant} {...props}>
            {isExpandable && (
                <SlideWrapper aria-label="Slide window up down">
                    <CursorIcon variant={variant} />
                </SlideWrapper>
            )}
            <StyledConversationHeader>
                {leadIcon}
                <StyledHeaderInformation>
                    {title && (
                        <StyledTitle isPlaceholder={!props.title}>
                            {title}
                        </StyledTitle>
                    )}
                    {message && <StyledMessage>{message}</StyledMessage>}
                </StyledHeaderInformation>
                {trailIcons && (
                    <StyledTrailIcons>{trailIcons}</StyledTrailIcons>
                )}
            </StyledConversationHeader>
        </StyledConversationHeaderWrapper>
    )
}

export default ConversationHeader
