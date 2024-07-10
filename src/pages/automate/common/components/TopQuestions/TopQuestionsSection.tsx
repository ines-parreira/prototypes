import React, {useMemo} from 'react'

import {Link} from 'react-router-dom'
import {IntegrationType} from 'models/integration/constants'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {getIconFromType} from 'state/integrations/helpers'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import css from './TopQuestionsSection.less'
import {TopQuestionCard, TopQuestionCardLoading} from './TopQuestionCard'

const VIEW_ALL_LINK = '/app/automation/ai-recommendations'

type TopQuestion = {
    title: string
    ticketsCount: number
    templateKey: string
}

type Props = {
    newQuestionsCount?: number
    topQuestions: TopQuestion[]
    onCreateArticle: (templateKey: string) => void
    onDismiss: (templateKey: string) => void
    helpCenterFilter?: {
        options: {name: string; helpCenterId: number}[]
        selectedHelpCenterId: number
        setSelectedHelpCenterId: (helpCenterId: number) => void
    }
    shopFilter?: {
        options: {
            shopName: string
            shopType:
                | IntegrationType.Shopify
                | IntegrationType.BigCommerce
                | IntegrationType.Magento2
            integrationId: number
        }[]
        selectedShopIntegrationId: number
        setSelectedShopIntegrationId: (integrationId: number) => void
    }
}

const ShopFilter = (shopFilter: Required<Props>['shopFilter']) => {
    const options = useMemo(
        () =>
            shopFilter.options.map((option) => ({
                value: option.integrationId,
                text: option.shopName,
                label: (
                    <div className={css.filterLabel}>
                        <img
                            src={getIconFromType(option.shopType)}
                            className={css.shopLabelIcon}
                            alt="logo"
                        />
                        {option.shopName}
                    </div>
                ),
            })),
        [shopFilter.options]
    )

    return (
        <SelectField
            value={shopFilter.selectedShopIntegrationId}
            onChange={(value) => {
                shopFilter.setSelectedShopIntegrationId(value as number)
            }}
            options={options}
            dropdownMenuClassName={css.filterDropdownMenu}
            showSelectedOption
        />
    )
}

const HelpCenterFilter = (
    helpCenterFilter: Required<Props>['helpCenterFilter']
) => {
    const options = useMemo(
        () =>
            helpCenterFilter.options.map((option) => ({
                value: option.helpCenterId,
                text: option.name,
                label: (
                    <div className={css.filterLabel}>
                        <i
                            className="material-icons rounded"
                            style={{fontSize: 20}}
                            aria-label="arrow forward"
                        >
                            live_help
                        </i>
                        {option.name}
                    </div>
                ),
            })),
        [helpCenterFilter.options]
    )

    return (
        <SelectField
            value={helpCenterFilter.selectedHelpCenterId}
            onChange={(value) => {
                helpCenterFilter.setSelectedHelpCenterId(value as number)
            }}
            options={options}
            dropdownMenuClassName={css.filterDropdownMenu}
            showSelectedOption
        />
    )
}

const Header = ({
    shopFilter,
    helpCenterFilter,
    newQuestionsCount,
}: Pick<Props, 'shopFilter' | 'helpCenterFilter' | 'newQuestionsCount'>) => (
    <>
        <div className={css.header}>
            <div className={css.headerLeft}>
                <span className={css.headerCaption}>Recommendations</span>
                {newQuestionsCount && (
                    <Badge
                        className={css.headerNewBadge}
                        type={ColorType.LightSuccess}
                    >
                        {newQuestionsCount} new
                    </Badge>
                )}
            </div>
            <Link className={css.viewAll} to={VIEW_ALL_LINK}>
                View All{' '}
                <i
                    className="material-icons rounded"
                    style={{fontSize: 20}}
                    aria-label="arrow forward"
                >
                    arrow_forward
                </i>
            </Link>
        </div>

        <div className={css.subheader}>
            <div className={css.subheaderCaption}>
                Top asked questions (last 90 days)
            </div>

            <div className={css.filters}>
                {shopFilter && <ShopFilter {...shopFilter} />}
                {helpCenterFilter && <HelpCenterFilter {...helpCenterFilter} />}
            </div>
        </div>
    </>
)

const TopQuestionsEmpty = () => (
    <div className={css.topQuestionsEmpty}>
        <div className={css.allReviewed}>
            You’ve reviewed every recommendation!
        </div>
        <div className={css.checkAgainLater}>Check again later for more.</div>
        <div>
            <Link className={css.viewAll} to={VIEW_ALL_LINK}>
                View All
            </Link>
        </div>
    </div>
)

export const TopQuestionsSection = ({
    topQuestions,
    onCreateArticle,
    onDismiss,
    shopFilter,
    helpCenterFilter,
    newQuestionsCount,
}: Props) => {
    const top4Questions = topQuestions.slice(0, 4)

    return (
        <div className={css.container}>
            <Header
                shopFilter={shopFilter}
                helpCenterFilter={helpCenterFilter}
                newQuestionsCount={newQuestionsCount}
            />

            <div className={css.topQuestions}>
                {top4Questions.length > 0 ? (
                    top4Questions.map((question) => (
                        <TopQuestionCard
                            key={question.templateKey}
                            ticketsCount={question.ticketsCount}
                            title={question.title}
                            onCreateArticle={() =>
                                onCreateArticle(question.templateKey)
                            }
                            onDismiss={() => onDismiss(question.templateKey)}
                        />
                    ))
                ) : (
                    <TopQuestionsEmpty />
                )}
            </div>
        </div>
    )
}

export const TopQuestionsSectionLoading = () => (
    <div>
        <Header />

        <div className={css.topQuestions}>
            <TopQuestionCardLoading />
            <TopQuestionCardLoading />
            <TopQuestionCardLoading />
            <TopQuestionCardLoading />
        </div>
    </div>
)
