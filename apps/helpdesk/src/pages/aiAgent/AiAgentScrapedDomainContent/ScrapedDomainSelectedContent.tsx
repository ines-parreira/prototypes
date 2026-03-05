import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useId } from '@repo/hooks'

import { LegacyBadge as Badge, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import hideViewIcon from 'assets/img/icons/hide-view-right.svg'
import languageIcon from 'assets/img/icons/language.svg'
import logoShopify from 'assets/img/integrations/shopify.svg'
import type { ProductWithAiAgentStatus } from 'constants/integrations/types/shopify'
import type { ProductAdditionalInfoPayload } from 'models/ecommerce/types'
import type { ArticleWithLocalTranslation } from 'models/helpCenter/types'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import ItemWithTooltip from 'pages/common/components/ItemWithTooltip/ItemWithTooltip'
import IconInput from 'pages/common/forms/input/IconInput'

import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import type { IngestedResourceStatus } from './constant'
import { CONTENT_TYPE, MODAL_TRANSITION_DURATION_MS } from './constant'
import IngestionProductView from './IngestionProductView'
import IntegrationProductView from './IntegrationProductView'
import ProductAdditionalInfoView from './ProductAdditionalInfoView'
import ScrapedDomainQuestion from './ScrapedDomainQuestion'
import ScrapedDomainSelectedModal from './ScrapedDomainSelectedModal'
import type {
    BaseArticle,
    IngestedProduct,
    IngestedResourceWithArticleId,
} from './types'
import { getFormattedSyncDate, getFormattedSyncDatetime } from './utils'

import css from './ScrapedDomainSelectedContent.less'

type QuestionProps = {
    contentType: typeof CONTENT_TYPE.QUESTION
    selectedContent: IngestedResourceWithArticleId | null
    detail?: ArticleWithLocalTranslation | null
}

type ProductProps = {
    contentType: typeof CONTENT_TYPE.PRODUCT
    selectedContent: ProductWithAiAgentStatus | null
    detail?: IngestedProduct | null
    integrationId?: number | null
    additionalInfo?: ProductAdditionalInfoPayload | null
}

type FileQuestionProps = {
    contentType: typeof CONTENT_TYPE.FILE_QUESTION
    selectedContent: BaseArticle | null
    detail?: ArticleWithLocalTranslation | null
}

type UrlQuestionProps = {
    contentType: typeof CONTENT_TYPE.URL_QUESTION
    selectedContent: IngestedResourceWithArticleId | null
    detail?: ArticleWithLocalTranslation | null
}

type SharedProps = {
    shopName: string
    storeDomain?: string | null
    latestSync?: string | null
    isOpened: boolean
    isLoading: boolean
    onClose: () => void
    onUpdateStatus?: (
        id: number,
        { status }: { status: IngestedResourceStatus },
    ) => Promise<void>
}

type Props = (
    | QuestionProps
    | ProductProps
    | FileQuestionProps
    | UrlQuestionProps
) &
    SharedProps

const SelectedProductView = ({
    product,
    detail,
    storeWebsiteContentRoute,
    latestSync,
    integrationId,
    additionalInfo,
}: {
    product: ProductWithAiAgentStatus
    detail: IngestedProduct
    storeWebsiteContentRoute: string
    latestSync?: string | null
    integrationId?: number | null
    additionalInfo?: ProductAdditionalInfoPayload | null
}) => {
    const id = useId()
    const syncDateId = `syncDate-${id}`
    const syncDateString = getFormattedSyncDate(latestSync)
    const syncDateTimeString = getFormattedSyncDatetime(latestSync)
    const isAdditionalInfoEnabled = useFlag(
        FeatureFlagKey.AiAgentProductAdditionalInfo,
    )
    const defaultExpandedItem = useMemo(
        () =>
            isAdditionalInfoEnabled && integrationId && product
                ? 'additional-info'
                : 'store-integration',
        [isAdditionalInfoEnabled, integrationId, product],
    )

    return (
        <div className={css.contentContainer}>
            <div className={css.productContainer}>
                <Accordion defaultExpandedItem={defaultExpandedItem}>
                    {isAdditionalInfoEnabled && integrationId && product && (
                        <AccordionItem id="additional-info">
                            <AccordionHeader>
                                <div className={css.productHeaderContainer}>
                                    <i
                                        className="material-icons"
                                        style={{
                                            fontSize: '20px',
                                            color: 'var(--content-neutral-secondary)',
                                        }}
                                    >
                                        edit
                                    </i>
                                    <div className={css.productHeader}>
                                        <span className="body-semibold">
                                            Custom product information
                                        </span>
                                        <span className="body-regular">
                                            Add custom details AI Agent can
                                            reference about this product.
                                        </span>
                                    </div>
                                </div>
                            </AccordionHeader>
                            <AccordionBody>
                                <ProductAdditionalInfoView
                                    integrationId={integrationId}
                                    productId={String(product.id)}
                                    initialValue={additionalInfo?.data}
                                />
                            </AccordionBody>
                        </AccordionItem>
                    )}
                    {product && (
                        <AccordionItem id="store-integration">
                            <AccordionHeader>
                                <div className={css.productHeaderContainer}>
                                    <img
                                        src={logoShopify}
                                        alt="shopify logo"
                                        width={20}
                                        height={20}
                                    />
                                    <div className={css.productHeader}>
                                        <span className="body-semibold">
                                            Shopify app
                                        </span>
                                        <span className="body-regular">
                                            This information syncs automatically
                                            from your Shopify product catalog.
                                        </span>
                                    </div>
                                </div>
                            </AccordionHeader>
                            <AccordionBody>
                                <IntegrationProductView product={product} />
                            </AccordionBody>
                        </AccordionItem>
                    )}
                    {detail && (
                        <AccordionItem id="store-domain">
                            <AccordionHeader>
                                <div className={css.productHeaderContainer}>
                                    <img
                                        src={languageIcon}
                                        alt="language icon"
                                        width={20}
                                        height={20}
                                    />
                                    <div className={css.productHeader}>
                                        <div className={css.productHeaderTitle}>
                                            <span className="body-semibold">
                                                Store website
                                            </span>
                                            {latestSync && (
                                                <ItemWithTooltip
                                                    id={syncDateId}
                                                    item={`Last synced ${syncDateString}`}
                                                    tooltip={syncDateTimeString}
                                                    className={css.latestSync}
                                                />
                                            )}
                                        </div>
                                        <span className="body-regular">
                                            To update this information, edit
                                            your website and{' '}
                                            <a
                                                href={storeWebsiteContentRoute}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                re-sync in Gorgias.
                                            </a>
                                        </span>
                                    </div>
                                </div>
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

const ScrapedDomainSelectedContent = (props: Props) => {
    const {
        shopName,
        storeDomain,
        latestSync,
        selectedContent,
        contentType,
        isOpened,
        isLoading,
        onClose,
        detail,
        onUpdateStatus,
    } = props
    const { routes } = useAiAgentNavigation({ shopName })
    const [isTitleOverflowing, setIsTitleOverflowing] = useState(false)
    const [titleRef, setTitleRef] = useState<HTMLDivElement | null>(null)

    const titleForQuestion = 'Question details'
    const titleForProduct = useMemo(
        () =>
            (selectedContent as ProductWithAiAgentStatus)?.title ??
            'Product details',
        [selectedContent],
    )

    const title =
        contentType === CONTENT_TYPE.QUESTION
            ? titleForQuestion
            : titleForProduct

    const titleCallbackRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            setTitleRef(node)
        }
    }, [])

    useLayoutEffect(() => {
        if (titleRef) {
            setIsTitleOverflowing(titleRef.scrollWidth > titleRef.offsetWidth)
        }
    }, [title, titleRef])

    const selectedQuestionContent =
        selectedContent as IngestedResourceWithArticleId
    const selectedQuestionDetail = detail as ArticleWithLocalTranslation
    const contentForQuestion = (
        <ScrapedDomainQuestion
            questionId={selectedQuestionContent?.id}
            questionStatus={selectedQuestionContent?.status}
            questionTitle={selectedQuestionContent?.title}
            questionWebPages={selectedQuestionContent?.web_pages}
            onUpdateStatus={onUpdateStatus}
            questionAnswer={selectedQuestionDetail?.translation?.content}
        />
    )
    const productProps = props as ProductProps
    const contentForProduct = (
        <SelectedProductView
            product={selectedContent as ProductWithAiAgentStatus}
            detail={detail as IngestedProduct}
            storeWebsiteContentRoute={
                storeDomain
                    ? routes.knowledgeSourcesByDomain(storeDomain)
                    : routes.knowledgeSources
            }
            latestSync={latestSync}
            integrationId={productProps.integrationId}
            additionalInfo={productProps.additionalInfo}
        />
    )

    const UsedByAiAgentBadge = () => (
        <Badge type="light-success" upperCase={false}>
            <IconInput icon="check" className={css.badgeIcon} />
            In use by AI Agent
        </Badge>
    )

    const NotUsedByAiAgentBadge = () => (
        <Badge type="light-grey" upperCase={false}>
            <IconInput icon="close" className={css.badgeIcon} />
            Not in use by AI Agent
        </Badge>
    )

    const additionalContentForProduct = (
        <div className={css.additionalContent}>
            {(selectedContent as ProductWithAiAgentStatus)
                ?.is_used_by_ai_agent ? (
                <UsedByAiAgentBadge />
            ) : (
                <NotUsedByAiAgentBadge />
            )}
        </div>
    )

    const content =
        contentType === CONTENT_TYPE.QUESTION
            ? contentForQuestion
            : contentForProduct

    const additionalContent =
        contentType === CONTENT_TYPE.PRODUCT
            ? additionalContentForProduct
            : null

    return (
        <ScrapedDomainSelectedModal
            isLoading={isLoading}
            isOpened={isOpened}
            portalRootId="app-root"
            onBackdropClick={onClose}
            transitionDurationMs={MODAL_TRANSITION_DURATION_MS}
            containerZIndices={[100, -1]}
            allowClickThrough={true}
        >
            <div className={css.header}>
                <div ref={titleCallbackRef} className={css.headerTitle}>
                    {title}
                </div>
                {isTitleOverflowing && titleRef && (
                    <Tooltip target={titleRef} placement="bottom">
                        Products details for the {title}
                    </Tooltip>
                )}
                <div className={css.headerActions}>
                    {additionalContent}
                    <img
                        src={hideViewIcon}
                        alt="hide-view-icon"
                        className={css.headerAction}
                        onClick={onClose}
                    />
                </div>
            </div>
            {content}
        </ScrapedDomainSelectedModal>
    )
}

export default ScrapedDomainSelectedContent
