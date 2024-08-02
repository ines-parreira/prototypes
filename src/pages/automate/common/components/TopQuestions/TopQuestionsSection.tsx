import React, {useMemo} from 'react'

import {Link} from 'react-router-dom'
import {IntegrationType} from 'models/integration/constants'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {getIconFromType} from 'state/integrations/helpers'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {logEvent, SegmentEvent} from 'common/segment'
import css from './TopQuestionsSection.less'
import {
    TopQuestionCard,
    TopQuestionCardGhost,
    TopQuestionCardLoading,
} from './TopQuestionCard'

const VIEW_ALL_LINK = '/app/automation/ai-recommendations'

export type TopQuestion = {
    title: string
    ticketsCount: number
    templateKey: string
    reviewAction?:
        | 'archive'
        | 'publish'
        | 'saveAsDraft'
        | 'dismissFromTopQuestions'
}

export type TopQuestionsSectionProps = {
    newQuestionsCount?: number
    topQuestions: TopQuestion[]
    onCreateArticle: (templateKey: string) => Promise<void>
    onDismiss: (templateKey: string) => Promise<void>
    helpCenterFilter?: {
        options: {name: string; helpCenterId: number}[]
        setSelectedHelpCenterId: (helpCenterId: number) => void
    }
    storeFilter?: {
        options: {
            shopName: string
            shopType:
                | IntegrationType.Shopify
                | IntegrationType.BigCommerce
                | IntegrationType.Magento2
            integrationId: number
        }[]
        setSelectedStoreIntegrationId: (integrationId: number) => void
    }
    storeIntegrationId: number
    helpCenterId: number
}

export const StoreFilter = ({
    storeIntegrationId,
    storeFilter,
}: {
    storeIntegrationId: number
    storeFilter: Required<TopQuestionsSectionProps>['storeFilter']
}) => {
    const options = useMemo(
        () =>
            storeFilter.options.map((option) => ({
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
        [storeFilter.options]
    )

    return (
        <SelectField
            value={storeIntegrationId}
            onChange={(value) => {
                storeFilter.setSelectedStoreIntegrationId(value as number)
            }}
            options={options}
            dropdownMenuClassName={css.filterDropdownMenu}
            showSelectedOption
        />
    )
}

export const HelpCenterFilter = ({
    helpCenterFilter,
    helpCenterId,
}: {
    helpCenterId: number
    helpCenterFilter: Required<TopQuestionsSectionProps>['helpCenterFilter']
}) => {
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
            value={helpCenterId}
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
    storeFilter,
    helpCenterFilter,
    storeIntegrationId,
    helpCenterId,
    newQuestionsCount,
}: Partial<
    Pick<
        TopQuestionsSectionProps,
        | 'storeFilter'
        | 'helpCenterFilter'
        | 'newQuestionsCount'
        | 'storeIntegrationId'
        | 'helpCenterId'
    >
>) => {
    const viewAllLink = useMemo(() => {
        if (!helpCenterId || !storeIntegrationId) {
            return null
        }

        const searchParams = new URLSearchParams({
            help_center_id: helpCenterId.toString(),
            store_integration_id: storeIntegrationId.toString(),
        }).toString()

        return `${VIEW_ALL_LINK}?${searchParams}`
    }, [helpCenterId, storeIntegrationId])

    return (
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
                {viewAllLink && (
                    <Link
                        className={css.viewAll}
                        to={viewAllLink}
                        onClick={() =>
                            logEvent(
                                SegmentEvent.AutomateTopQuestionsSectionClickViewAll
                            )
                        }
                    >
                        View All{' '}
                        <i
                            className="material-icons rounded"
                            style={{fontSize: 20}}
                            aria-label="arrow forward"
                        >
                            arrow_forward
                        </i>
                    </Link>
                )}
            </div>

            <div className={css.subheader}>
                <div className={css.subheaderCaption}>
                    Top asked questions (last 90 days)
                </div>

                <div className={css.filters}>
                    {storeFilter && storeIntegrationId && (
                        <StoreFilter
                            storeFilter={storeFilter}
                            storeIntegrationId={storeIntegrationId}
                        />
                    )}
                    {helpCenterFilter && helpCenterId && (
                        <HelpCenterFilter
                            helpCenterFilter={helpCenterFilter}
                            helpCenterId={helpCenterId}
                        />
                    )}
                </div>
            </div>
        </>
    )
}

export const TopQuestionsSectionNoRecommendations = ({
    storeFilter,
    helpCenterFilter,
    storeIntegrationId,
    helpCenterId,
}: Pick<
    TopQuestionsSectionProps,
    'storeFilter' | 'helpCenterFilter' | 'storeIntegrationId' | 'helpCenterId'
>) => (
    <TopQuestionsSectionWrapper
        storeFilter={storeFilter}
        helpCenterFilter={helpCenterFilter}
        storeIntegrationId={storeIntegrationId}
        helpCenterId={helpCenterId}
    >
        <div className={css.topQuestionsEmpty}>
            <div className={css.noRecommendationsYet}>
                You have no recommendations for this store yet.
            </div>
        </div>
    </TopQuestionsSectionWrapper>
)

export const TopQuestionsSectionConnectStoreToEmail = ({
    storeFilter,
    helpCenterFilter,
    storeIntegrationId,
    helpCenterId,
}: Pick<
    TopQuestionsSectionProps,
    'storeFilter' | 'helpCenterFilter' | 'storeIntegrationId' | 'helpCenterId'
>) => (
    <TopQuestionsSectionWrapper
        storeFilter={storeFilter}
        helpCenterFilter={helpCenterFilter}
        storeIntegrationId={storeIntegrationId}
        helpCenterId={helpCenterId}
    >
        <div className={css.topQuestionsEmpty}>
            <div className={css.connectToEmail}>
                This store must be connected to an email to receive
                recommendations.
            </div>

            <div className={css.link}>
                <Link to={'/app/settings/channels/email'} target="_blank">
                    Connect store to email
                </Link>
            </div>
        </div>
    </TopQuestionsSectionWrapper>
)

export const TopQuestionsSectionAllReviewed = ({
    storeFilter,
    helpCenterFilter,
    storeIntegrationId,
    helpCenterId,
    newQuestionsCount,
}: Pick<
    TopQuestionsSectionProps,
    | 'storeFilter'
    | 'helpCenterFilter'
    | 'storeIntegrationId'
    | 'helpCenterId'
    | 'newQuestionsCount'
>) => (
    <TopQuestionsSectionWrapper
        storeFilter={storeFilter}
        helpCenterFilter={helpCenterFilter}
        storeIntegrationId={storeIntegrationId}
        helpCenterId={helpCenterId}
        newQuestionsCount={newQuestionsCount}
    >
        <div className={css.topQuestionsEmpty}>
            <div className={css.allReviewed}>
                You’ve reviewed every recommendation!
            </div>
            <div className={css.checkAgainLater}>
                Check again later for more.
            </div>
            <div>
                <Link className={css.link} to={VIEW_ALL_LINK}>
                    View All
                </Link>
            </div>
        </div>
    </TopQuestionsSectionWrapper>
)

const TopQuestionsSectionWrapper = ({
    storeFilter,
    helpCenterFilter,
    storeIntegrationId,
    helpCenterId,
    newQuestionsCount,
    children,
}: Pick<
    TopQuestionsSectionProps,
    | 'storeFilter'
    | 'helpCenterFilter'
    | 'storeIntegrationId'
    | 'helpCenterId'
    | 'newQuestionsCount'
> & {children: React.ReactNode}) => (
    <div className={css.container}>
        <Header
            storeFilter={storeFilter}
            helpCenterFilter={helpCenterFilter}
            storeIntegrationId={storeIntegrationId}
            helpCenterId={helpCenterId}
            newQuestionsCount={newQuestionsCount}
        />

        <div className={css.topQuestions}>{children}</div>
    </div>
)

export const TopQuestionsSection = ({
    topQuestions,
    onCreateArticle,
    onDismiss,
    storeFilter,
    helpCenterFilter,
    newQuestionsCount,
    storeIntegrationId,
    helpCenterId,
}: TopQuestionsSectionProps) => {
    const top4Questions = topQuestions.slice(0, 4)

    return (
        <TopQuestionsSectionWrapper
            storeFilter={storeFilter}
            helpCenterFilter={helpCenterFilter}
            storeIntegrationId={storeIntegrationId}
            helpCenterId={helpCenterId}
            newQuestionsCount={newQuestionsCount}
        >
            {top4Questions.map((question) => (
                <TopQuestionCard
                    key={question.templateKey}
                    ticketsCount={question.ticketsCount}
                    title={question.title}
                    onCreateArticle={() =>
                        onCreateArticle(question.templateKey)
                    }
                    onDismiss={() => onDismiss(question.templateKey)}
                />
            ))}
            {Array.from({length: 4 - top4Questions.length}).map((_, index) => (
                <TopQuestionCardGhost key={index} />
            ))}
        </TopQuestionsSectionWrapper>
    )
}

export const TopQuestionsSectionLoading = (
    headerProps: Partial<
        Pick<
            TopQuestionsSectionProps,
            | 'storeFilter'
            | 'helpCenterFilter'
            | 'storeIntegrationId'
            | 'helpCenterId'
        >
    >
) => (
    <div>
        <Header {...headerProps} />

        <div className={css.topQuestions}>
            <TopQuestionCardLoading />
            <TopQuestionCardLoading />
            <TopQuestionCardLoading />
            <TopQuestionCardLoading />
        </div>
    </div>
)
