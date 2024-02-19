import React from 'react'

import useIsIntersectingWithBrowserViewport from 'pages/common/hooks/useIsIntersectingWithBrowserViewport'

import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'

import css from './WizardStepSkeleton.less'

type Props = {
    step: string
    footer: React.ReactNode
    preview?: React.ReactNode
    labels: Record<string, string>
    titles: Record<string, string>
    descriptions: Partial<Record<string, string>>
}

const WizardStepSkeleton: React.FC<Props> = ({
    step,
    children,
    preview,
    footer,
    labels,
    titles,
    descriptions,
}) => {
    const contentRef = React.useRef<HTMLDivElement>(null)
    const contentIsIntersecting =
        useIsIntersectingWithBrowserViewport(contentRef)

    return (
        <>
            <div className={css.wizard}>
                <div className={css.content} ref={contentRef}>
                    <WizardProgressHeader
                        labels={labels}
                        className={css.wizardProgressHeader}
                    />
                    <div className={css.heading}>
                        <div className="heading-page-semibold">
                            {titles[step]}
                        </div>
                        {descriptions[step] && (
                            <div
                                className={css.description}
                                dangerouslySetInnerHTML={{
                                    __html: descriptions[step] || '',
                                }}
                            />
                        )}
                    </div>
                    {children}
                </div>
                <div className={css.footer}>
                    {!contentIsIntersecting && (
                        <div className={css.footerShadow}></div>
                    )}
                    <div className={css.footerContent}>{footer}</div>
                </div>
            </div>
            {preview && (
                <div className={css.preview}>
                    <div className={css.previewCenter}>{preview}</div>
                </div>
            )}
        </>
    )
}

export default WizardStepSkeleton
