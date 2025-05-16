import { useRef } from 'react'

import { isObject } from 'lodash'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'
import useIsIntersectingWithBrowserViewport from 'pages/common/hooks/useIsIntersectingWithBrowserViewport'
import { AnimatedFadeInOut } from 'pages/settings/helpCenter/components/HelpCenterCreationWizard/components/AnimatedFadeInOut/AnimatedFadeInOut'

import css from './WizardStepSkeleton.less'

type Props = {
    step: string
    metaStep?: string
    footer: React.ReactNode
    preview?: React.ReactNode
    previewClassName?: string
    labels: Record<string, string>
    titles: Record<string, string | Record<string, string>>
    descriptions: Record<string, string | Record<string, string>>
    isLoading?: boolean
    children?: React.ReactNode
}

const isRecord = (
    value: string | Record<string, string>,
): value is Record<string, string> => {
    return isObject(value)
}

const WizardStepSkeleton: React.FC<Props> = ({
    step,
    children,
    preview,
    previewClassName,
    footer,
    labels,
    titles,
    descriptions,
    metaStep,
    isLoading,
}) => {
    const contentRef = useRef<HTMLDivElement>(null)
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
                        <AnimatedFadeInOut isLoading={!!isLoading}>
                            {isLoading ? (
                                <div className={css.loadingContainer}>
                                    <Skeleton height={32} />
                                    <Skeleton height={48} />
                                </div>
                            ) : (
                                <>
                                    <div className="heading-page-semibold">
                                        {stepTitle && isRecord(stepTitle)
                                            ? (stepTitle[metaStep ?? ''] ?? '')
                                            : stepTitle}
                                    </div>
                                    {descriptions[step] && (
                                        <div
                                            className={css.description}
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    metaStep &&
                                                    isRecord(stepDescription)
                                                        ? stepDescription[
                                                              metaStep
                                                          ]
                                                        : stepDescription,
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </AnimatedFadeInOut>
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
                <div className={previewClassName ?? css.preview}>
                    <div className={css.previewCenter}>{preview}</div>
                </div>
            )}
        </>
    )
}

export default WizardStepSkeleton
