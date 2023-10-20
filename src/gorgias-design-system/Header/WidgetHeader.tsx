import styled from '@emotion/styled'
import React, {HTMLAttributes} from 'react'
import {gorgiasColors} from 'gorgias-design-system/styles'

export interface WidgetHeaderProps {
    /**
     * The URL of the image to be displayed in the home page.
     */
    headerPictureUrl?: string | null
    /**
     * The title of the chat.
     */
    title: string
    /**
     * Display additional information in the conversation header.
     */
    message?: string
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
    variant?: WidgetHeaderVariant
}

export type WidgetHeaderVariant = 'light' | 'dark' | 'offline'

const StyledWidgetHeaderWrapper = styled.div<{
    variant: WidgetHeaderVariant
}>`
    display: block;
    color: ${({variant}) =>
        variant === 'light' ? gorgiasColors.white : gorgiasColors.dark};
    top: 0;
    position: sticky;
    z-index: 2;

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
    margin-bottom: 8px;
`

const CursorIcon = styled.div<{variant: WidgetHeaderVariant}>`
    height: 4px;
    width: 40px;
    background: ${({variant}) =>
        variant === 'light' ? gorgiasColors.white : gorgiasColors.dark};
    opacity: 0.5;
    border-radius: 10px;
`

const StyledWidgetHeader = styled.div<{isExpandable?: boolean}>`
    display: flex;
    align-items: center;
    flex-direction: row;

    ${({isExpandable}) =>
        isExpandable
            ? ' padding: 14px 16px 14px 32px;'
            : 'padding: 34px 16px 14px 32px;'}
`
const StyledTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    display: flex;
    height: 32px;
    align-items: center;
`

const StyledTrailIcons = styled.div`
    margin-left: auto;
    display: flex;
`

const StyledMessage = styled.div<{
    variant: WidgetHeaderVariant
}>`
    color: ${({variant}) =>
        variant === 'light' ? gorgiasColors.white : gorgiasColors.dark};
    padding: 20px 32px;
    font-size: 24px;
    font-weight: 600;
    line-height: 32px;
    z-index: 2;
`

const StyledWidgetHeaderImageWrapper = styled.div`
    height: 28px;
    max-width: calc(100% - 100px);
`

const StyledWidgetHeaderImage = styled.img`
    max-height: 100%;
`

/**
 *  Can display chat title, introduction messages and reply time set by merchants, as well as high-level actions.
 */
const WidgetHeader: React.FC<
    HTMLAttributes<HTMLDivElement> & WidgetHeaderProps
> = ({...props}) => {
    const {
        headerPictureUrl,
        isExpandable,
        message,
        title,
        trailIcons,
        variant = 'light',
    } = props
    return (
        <>
            <StyledWidgetHeaderWrapper variant={variant} {...props}>
                {isExpandable && (
                    <SlideWrapper>
                        <CursorIcon variant={variant} />
                    </SlideWrapper>
                )}
                <StyledWidgetHeader isExpandable={isExpandable}>
                    {headerPictureUrl ? (
                        <StyledWidgetHeaderImageWrapper>
                            <StyledWidgetHeaderImage
                                src={headerPictureUrl}
                                alt="chat home header logo"
                            />
                        </StyledWidgetHeaderImageWrapper>
                    ) : (
                        title && <StyledTitle>{title}</StyledTitle>
                    )}
                    {trailIcons && (
                        <StyledTrailIcons>{trailIcons}</StyledTrailIcons>
                    )}
                </StyledWidgetHeader>
            </StyledWidgetHeaderWrapper>
            {message && (
                <StyledMessage variant={variant}>{message}</StyledMessage>
            )}
        </>
    )
}

export default WidgetHeader
