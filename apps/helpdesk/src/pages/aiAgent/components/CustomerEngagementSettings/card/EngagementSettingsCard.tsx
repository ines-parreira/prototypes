import { forwardRef } from 'react'

import css from './EngagementSettingsCard.less'

export const EngagementSettingsCard = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} className={css.cardContainer} {...props} />)

export const EngagementSettingsCardContentWrapper = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
    <div ref={ref} className={css.cardContentWrapper} {...props} />
))

export const EngagementSettingsCardContent = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} className={css.cardContent} {...props} />)

export const EngagementSettingsCardTitle = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} className={css.cardTitle} {...props} />)

export const EngagementSettingsCardDescription = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} className={css.cardDescription} {...props} />)

export const EngagementSettingsCardImage = forwardRef<
    HTMLImageElement,
    React.HTMLAttributes<HTMLImageElement> & { alt?: string; src?: string }
>(({ alt, src, ...props }, ref) => (
    <img alt={alt} src={src} ref={ref} className={css.cardImage} {...props} />
))

export const EngagementSettingsCardFooter = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} className={css.cardFooter} {...props} />)
