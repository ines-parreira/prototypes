import React from 'react'

import {isObject} from 'lodash'
import useIsIntersectingWithBrowserViewport from 'pages/common/hooks/useIsIntersectingWithBrowserViewport'

import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'

import css from './WizardStepSkeleton.less'

type Props = {
    step: string
    metaStep?: string
    footer: React.ReactNode
    preview?: React.ReactNode
    labels: Record<string, string>
    titles: Record<string, string | Record<string, string>>
    descriptions: Record<string, string | Record<string, string>>
}

const isRecord = (
    value: string | Record<string, string>
): value is Record<string, string> => {
    return isObject(value)
}

const WizardStepSkeleton: React.FC<Props> = ({
    step,
    children,
    preview,
    footer,
    labels,
    titles,
    descriptions,
    metaStep,
}) => {
    const contentRef = React.useRef<HTMLDivElement>(null)
    const contentIsIntersecting =
        useIsIntersectingWithBrowserViewport(contentRef)

    const stepTitle = titles[step] || ''
    const stepDescription = descriptions[step] || ''

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
                            {metaStep && isRecord(stepTitle)
                                ? stepTitle[metaStep]
                                : stepTitle}
                        </div>
                        {descriptions[step] && (
                            <div
                                className={css.description}
                                dangerouslySetInnerHTML={{
                                    __html:
                                        metaStep && isRecord(stepDescription)
                                            ? stepDescription[metaStep]
                                            : stepDescription,
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
