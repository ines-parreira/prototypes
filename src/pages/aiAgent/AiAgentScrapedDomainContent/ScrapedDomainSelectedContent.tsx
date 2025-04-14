import React from 'react'

import hideViewIcon from 'assets/img/icons/hide-view-right.svg'

import { CONTENT_TYPE, MODAL_TRANSITION_DURATION_MS } from './constant'
import ScrapedDomainSelectedModal from './ScrapedDomainSelectedModal'
import { ScrapedContent } from './types'

import css from './ScrapedDomainSelectedContent.less'

type Props = {
    selectedContent: ScrapedContent | null
    contentType: string
    isOpened: boolean
    isLoading: boolean
    onClose: () => void
}

const SelectedQuestionView = ({
    question,
}: {
    question: ScrapedContent | null
}) => {
    // Mocked view to replace by actual view in the next iteration
    // https://linear.app/gorgias/issue/AIKNL-88/implement-functionality-for-pages-content-tab
    return (
        <div className={css.contentContainer}>
            <h3>Selected Question View</h3>
            {question && <p>{question.title}</p>}
        </div>
    )
}

const SelectedProductView = ({
    product,
}: {
    product: ScrapedContent | null
}) => {
    // Mocked view to replace by actual view in the next iteration
    // https://linear.app/gorgias/issue/AIKNL-89/implement-functionality-for-product-content-tab
    return (
        <div className={css.contentContainer}>
            <h3>Selected Product View</h3>
            {product && <p>{product.title}</p>}
        </div>
    )
}

const ScrapedDomainSelectedContent = ({
    selectedContent,
    contentType,
    isOpened,
    isLoading,
    onClose,
}: Props) => {
    const titleForQuestion = 'Question details'
    const titleForProduct = 'Product details'

    const contentForQuestion = (
        <SelectedQuestionView question={selectedContent} />
    )
    const contentForProduct = <SelectedProductView product={selectedContent} />

    const title =
        contentType === CONTENT_TYPE.QUESTION
            ? titleForQuestion
            : titleForProduct

    const content =
        contentType === CONTENT_TYPE.QUESTION
            ? contentForQuestion
            : contentForProduct

    return (
        <ScrapedDomainSelectedModal
            isLoading={isLoading}
            isOpened={isOpened}
            portalRootId="app-root"
            onBackdropClick={onClose}
            transitionDurationMs={MODAL_TRANSITION_DURATION_MS}
            containerZIndices={[100, -1]}
        >
            <div className={css.header}>
                <div className={css.headerTitle}>{title}</div>
                <img
                    src={hideViewIcon}
                    alt="hide-view-icon"
                    className={css.headerAction}
                    onClick={onClose}
                />
            </div>
            {content}
        </ScrapedDomainSelectedModal>
    )
}

export default ScrapedDomainSelectedContent
