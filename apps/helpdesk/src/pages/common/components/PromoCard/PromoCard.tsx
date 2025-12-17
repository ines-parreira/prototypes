import type React from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'

import { useLocalStorage } from '@repo/hooks'
import cn from 'classnames'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

import {
    LegacyButton as Button,
    LegacyIconButton as IconButton,
} from '@gorgias/axiom'

import css from './PromoCard.less'

interface PromoCardContextType {
    showVideoModal: boolean
    setShowVideoModal: (show: boolean) => void
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
    collapsible: boolean
    isDismissed: boolean
    dismiss: () => void
    dismissible: boolean
}

const PromoCardContext = createContext<PromoCardContextType | undefined>(
    undefined,
)

const usePromoCardContext = () => {
    const context = useContext(PromoCardContext)
    if (!context) {
        throw new Error(
            'PromoCard compound components must be used within PromoCard',
        )
    }
    return context
}

interface PromoCardRootProps {
    children: React.ReactNode
    className?: string
    collapsible?: boolean
    defaultCollapsed?: boolean
    dismissible?: boolean
    storageKey?: string
}

const PromoCardRoot = ({
    children,
    className,
    collapsible = false,
    defaultCollapsed = false,
    dismissible = false,
    storageKey = 'promo-card-dismissed',
}: PromoCardRootProps) => {
    const [showVideoModal, setShowVideoModal] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(
        collapsible && defaultCollapsed,
    )
    const [isDismissed, setIsDismissed] = useLocalStorage(
        dismissible ? storageKey : 'temp-key',
        false,
    )

    const dismiss = useCallback(() => {
        if (dismissible) {
            setIsDismissed(true)
        }
    }, [dismissible, setIsDismissed])

    if (isDismissed) {
        return null
    }

    return (
        <PromoCardContext.Provider
            value={{
                showVideoModal,
                setShowVideoModal,
                isCollapsed,
                setIsCollapsed,
                collapsible,
                isDismissed,
                dismiss,
                dismissible,
            }}
        >
            <div className={cn(css.promoCard, className)}>
                {dismissible && <CloseButton />}
                {children}
            </div>
        </PromoCardContext.Provider>
    )
}

interface MediaProps {
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

const Media = ({ children, className, style }: MediaProps) => {
    const { isCollapsed } = usePromoCardContext()

    return (
        <div
            className={cn(css.mediaContainer, className, {
                [css.collapsed]: isCollapsed,
            })}
            style={style}
        >
            {children}
        </div>
    )
}

interface ContentProps {
    children: React.ReactNode
    className?: string
}

const Content = ({ children, className }: ContentProps) => {
    return <div className={cn(css.contentContainer, className)}>{children}</div>
}

interface HeaderProps {
    children: React.ReactNode
    className?: string
}

const Header = ({ children, className }: HeaderProps) => {
    return <div className={cn(css.header, className)}>{children}</div>
}

interface TitleProps {
    children: React.ReactNode
}

const Title = ({ children }: TitleProps) => {
    const { isCollapsed, setIsCollapsed, collapsible } = usePromoCardContext()

    const handleCollapse = () => {
        if (collapsible) {
            setIsCollapsed(!isCollapsed)
        }
    }

    return (
        <h3 className={css.title}>
            {children}
            {collapsible && (
                <IconButton
                    className={cn(css.collapseButton, css.collapseIcon, {
                        [css.collapsed]: isCollapsed,
                    })}
                    onClick={handleCollapse}
                    aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                    aria-expanded={!isCollapsed}
                    intent="secondary"
                    fillStyle="ghost"
                    icon={
                        isCollapsed
                            ? 'keyboard_arrow_up'
                            : 'keyboard_arrow_down'
                    }
                    size={'small'}
                />
            )}
        </h3>
    )
}

// Description Component
interface DescriptionProps {
    children: React.ReactNode
}

const Description = ({ children }: DescriptionProps) => {
    const { isCollapsed } = usePromoCardContext()

    return (
        <p
            className={cn(css.description, {
                [css.collapsed]: isCollapsed,
            })}
        >
            {children}
        </p>
    )
}

interface VideoThumbnailProps {
    poster: string
    alt?: string
    videoUrl?: string
    onClick?: () => void
    className?: string
}

/**
 * VideoThumbnail is a flexible component designed to display video poster images
 * with varying aspect ratios and dimensions. Due to the diverse nature of thumbnail
 * images (different sizes, ratios, and positioning requirements), this component
 * does not provide default styling.
 *
 * Custom styles must be applied via the `className` prop to properly position
 * and size the thumbnail image and container according to your specific design needs.
 *
 * @example
 * <VideoThumbnail
 *   poster={thumbnailUrl}
 *   alt="Video description"
 *   videoUrl={videoUrl}
 *   className="custom-video-thumbnail"
 * />
 *
 * // CSS
 * .custom-video-thumbnail {
 *   position: relative;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 * }
 * .custom-video-thumbnail img {
 *   width: 200px;
 *   height: 150px;
 * }
 */
const VideoThumbnail = ({
    poster,
    alt,
    videoUrl,
    onClick,
    className,
}: VideoThumbnailProps) => {
    const { setShowVideoModal } = usePromoCardContext()

    const handleClick = () => {
        onClick?.()
        if (videoUrl) {
            setShowVideoModal(true)
        }
    }

    return (
        <div
            className={className}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleClick()
                }
            }}
        >
            <img src={poster} alt={alt || 'thumbnail image'} />
            <div>
                <IconButton
                    aria-label="Play video"
                    icon="play_circle_filled"
                    intent="secondary"
                    fillStyle="fill"
                    size="small"
                    iconClassName={css.playButton}
                />
            </div>
        </div>
    )
}

interface TextProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

const Text = ({ children, className, style }: TextProps) => {
    const { isCollapsed } = usePromoCardContext()

    return (
        <div
            className={cn(css.text, className, {
                [css.collapsed]: isCollapsed,
            })}
            style={style}
        >
            {children}
        </div>
    )
}

interface ProgressBarProps {
    className?: string
    percentage: number
    trackColor?: string
    fillColor?: string
    height?: number
    children?: React.ReactNode
}

const ProgressBar = ({
    className,
    percentage,
    trackColor,
    fillColor,
    height = 8,
    children,
}: ProgressBarProps) => {
    const { isCollapsed } = usePromoCardContext()

    return (
        <div
            className={cn(css.progressSection, className, {
                [css.collapsed]: isCollapsed,
            })}
        >
            <div
                className={css.progressBarTrack}
                style={{
                    backgroundColor: trackColor,
                    height: `${height}px`,
                }}
            >
                <div
                    className={css.progressBarFill}
                    style={{
                        width: `${percentage}%`,
                        background: fillColor,
                    }}
                />
            </div>
            {children}
        </div>
    )
}

interface ActionsProps {
    children: React.ReactNode
}

const Actions = ({ children }: ActionsProps) => {
    const { isCollapsed } = usePromoCardContext()

    return (
        <div
            className={cn(css.actions, {
                [css.collapsed]: isCollapsed,
            })}
        >
            {children}
        </div>
    )
}

interface CloseButtonProps {
    className?: string
}

const CloseButton = ({ className }: CloseButtonProps) => {
    const { dismiss, dismissible } = usePromoCardContext()

    if (!dismissible) {
        return null
    }

    return (
        <IconButton
            className={cn(css.closeButton, className)}
            onClick={dismiss}
            aria-label="Dismiss promo card"
            icon="close"
            fillStyle="ghost"
            intent="secondary"
            size="small"
        />
    )
}

interface ActionButtonProps {
    label: string
    onClick?: () => void
    href?: string
    to?: string
    target?: string
    variant?: 'primary' | 'secondary' | 'ghost'
    disabled?: boolean
    isLoading?: boolean
    Icon?: React.ComponentType<{ className?: string }>
    className?: string
}

const ActionButton = ({
    label,
    onClick,
    href,
    to,
    target,
    variant = 'primary',
    disabled,
    isLoading,
    Icon,
    className,
}: ActionButtonProps) => {
    const baseClassName = cn(css.ctaButton, css[variant], className)
    const content = (
        <>
            {Icon && <Icon className={css.ctaIcon} />}
            {label}
        </>
    )

    // External link
    if (href) {
        return (
            <a
                href={href}
                target={target}
                rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                className={baseClassName}
                onClick={onClick}
            >
                {content}
            </a>
        )
    }

    // Internal router link
    if (to) {
        return (
            <Link to={to} className={baseClassName} onClick={onClick}>
                {content}
            </Link>
        )
    }

    const intent = variant === 'primary' ? 'primary' : 'secondary'
    const fillStyle = variant === 'primary' ? 'fill' : 'ghost'

    // Default button
    return (
        <Button
            intent={intent}
            fillStyle={fillStyle}
            size="medium"
            onClick={onClick}
            isDisabled={disabled}
            isLoading={isLoading}
            className={baseClassName}
        >
            {content}
        </Button>
    )
}

interface VideoModalProps {
    videoUrl: string
    ctaButton?: {
        label: string
        onClick?: () => void
        href?: string
        to?: string
        target?: string
        variant?: 'primary' | 'secondary' | 'ghost'
        disabled?: boolean
        Icon?: React.ComponentType<{ className?: string }>
        className?: string
    }
}

const VideoModal = ({ videoUrl, ctaButton }: VideoModalProps) => {
    const { showVideoModal, setShowVideoModal } = usePromoCardContext()
    const [showCTA, setShowCTA] = useState(false)

    const handleCloseModal = useCallback(() => {
        setShowVideoModal(false)
        setShowCTA(false)
    }, [setShowVideoModal])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showVideoModal) {
                handleCloseModal()
            }
        }

        if (showVideoModal) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [showVideoModal, handleCloseModal])

    if (!showVideoModal) return null

    const handleVideoEnd = () => {
        setShowCTA(true)
    }

    const handlePlay = () => {
        // Hide CTA when user starts playing video again (e.g., after rewinding)
        setShowCTA(false)
    }

    const handleClick = () => {
        if (ctaButton && ctaButton.onClick) {
            ctaButton.onClick()
        }

        // Always close the modal
        handleCloseModal()
    }

    return createPortal(
        <div
            className={css.videoModalContainer}
            onClick={handleCloseModal}
            role="dialog"
            aria-label="Video player"
            aria-modal="true"
        >
            <div
                className={css.videoModalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <IconButton
                    className={css.videoModalClose}
                    onClick={handleCloseModal}
                    aria-label="Close video modal"
                    icon="close"
                    intent="secondary"
                    fillStyle="ghost"
                    size="small"
                />
                <video
                    src={videoUrl}
                    className={css.video}
                    controls
                    autoPlay
                    playsInline
                    onEnded={handleVideoEnd}
                    onPlay={handlePlay}
                />
                {showCTA && ctaButton && (
                    <div className={css.videoCTAOverlay}>
                        <ActionButton
                            label={ctaButton.label}
                            onClick={handleClick}
                            href={ctaButton.href}
                            to={ctaButton.to}
                            target={ctaButton.target}
                            variant={ctaButton.variant || 'secondary'}
                            disabled={ctaButton.disabled}
                            Icon={ctaButton.Icon}
                            className={ctaButton.className}
                        />
                    </div>
                )}
            </div>
        </div>,
        document.body,
    )
}

export const PromoCard = Object.assign(PromoCardRoot, {
    Media,
    Content,
    Header,
    Title,
    Description,
    Text,
    ProgressBar,
    VideoThumbnail,
    Actions,
    ActionButton,
    VideoModal,
    CloseButton,
})
