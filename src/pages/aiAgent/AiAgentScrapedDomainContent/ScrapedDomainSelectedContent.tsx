import React from 'react'

import { Banner } from '@gorgias/merchant-ui-kit'

import hideViewIcon from 'assets/img/icons/hide-view-right.svg'
import languageIcon from 'assets/img/icons/language.svg'
import logoShopify from 'assets/img/integrations/shopify.svg'
import { Product } from 'constants/integrations/types/shopify'
import { ArticleWithLocalTranslation } from 'models/helpCenter/types'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import { AlertType } from 'pages/common/components/Alert/Alert'

import {
    CONTENT_TYPE,
    IngestedResourceStatus,
    MODAL_TRANSITION_DURATION_MS,
} from './constant'
import IngestionProductView from './IngestionProductView'
import IntegrationProductView from './IntegrationProductView'
import ScrapedDomainQuestion from './ScrapedDomainQuestion'
import ScrapedDomainSelectedModal from './ScrapedDomainSelectedModal'
import { IngestedProduct, IngestedResourceWithArticleId } from './types'

import css from './ScrapedDomainSelectedContent.less'

type QuestionProps = {
    contentType: typeof CONTENT_TYPE.QUESTION
    selectedContent: IngestedResourceWithArticleId | null
    detail?: ArticleWithLocalTranslation | null
}

type ProductProps = {
    contentType: typeof CONTENT_TYPE.PRODUCT
    selectedContent: Product | null
    detail?: IngestedProduct | null
}

type SharedProps = {
    isOpened: boolean
    isLoading: boolean
    onClose: () => void
    onUpdateStatus?: (
        id: number,
        { status }: { status: IngestedResourceStatus },
    ) => Promise<void>
}

type Props = (QuestionProps | ProductProps) & SharedProps

const SelectedProductView = ({
    product,
    detail,
}: {
    product: Product
    detail: IngestedProduct
}) => {
    return (
        <div className={css.contentContainer}>
            <Banner variant="inline" icon type={AlertType.Info}>
                Inaccurate information? To edit product information, update it
                directly in Shopify or on your store website and re-sync in
                Gorgias.
            </Banner>

            <div className={css.productContainer}>
                <Accordion defaultExpandedItem="store-integration">
                    {product && (
                        <AccordionItem id="store-integration">
                            <AccordionHeader>
                                <img
                                    src={logoShopify}
                                    alt="shopify logo"
                                    className={css.icon}
                                    width={20}
                                    height={20}
                                />
                                <span className="body-semibold">
                                    From your Shopify app
                                </span>
                            </AccordionHeader>
                            <AccordionBody>
                                <IntegrationProductView product={product} />
                            </AccordionBody>
                        </AccordionItem>
                    )}
                    {detail && (
                        <AccordionItem id="store-domain">
                            <AccordionHeader>
                                <img
                                    src={languageIcon}
                                    alt="language icon"
                                    className={css.icon}
                                    width={20}
                                    height={20}
                                />
                                <span className="body-semibold">
                                    From your store website
                                </span>
                            </AccordionHeader>
                            <AccordionBody>
                                <IngestionProductView product={detail} />
                            </AccordionBody>
                        </AccordionItem>
                    )}
                </Accordion>
            </div>
        </div>
    )
}

const ScrapedDomainSelectedContent = ({
    selectedContent,
    contentType,
    isOpened,
    isLoading,
    onClose,
    detail,
    onUpdateStatus,
}: Props) => {
    const titleForQuestion = 'Question details'
    const titleForProduct = 'Product details'

    const contentForQuestion = (
        <ScrapedDomainQuestion
            question={selectedContent as IngestedResourceWithArticleId}
            detail={detail as ArticleWithLocalTranslation}
            onUpdateStatus={onUpdateStatus}
        />
    )
    const contentForProduct = (
        <SelectedProductView
            product={selectedContent as Product}
            detail={detail as IngestedProduct}
        />
    )

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
