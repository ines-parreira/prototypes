import React, { useMemo, useState } from 'react'

import classNames from 'classnames'

import { Skeleton, Tooltip } from '@gorgias/axiom'

import {
    ArticleTemplateType,
    HelpCenterArticleItem,
} from 'models/helpCenter/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import IconButton from 'pages/common/components/button/IconButton'
import CheckBox from 'pages/common/forms/CheckBox'

import { ARTICLE_TEMPLATE_CATEGORIES } from '../../../CategoriesView/components/ArticleTemplateCard/constants'
import { AnimatedFadeInOut } from '../AnimatedFadeInOut/AnimatedFadeInOut'

import css from './HelpCenterWizardArticleSection.less'

type Props = {
    articles: HelpCenterArticleItem[]
    category: string
    isLimitEnabled: boolean
    isLoading: boolean
    onEdit: (key: string) => void
    onSelect: (key: string) => void
    onHover: (key: string | undefined) => void
}

const ARTICLE_TEMPLATE_LIMIT = 1

const ArticleSection: React.FC<Props> = ({
    category,
    articles,
    isLoading,
    isLimitEnabled,
    onEdit,
    onSelect,
    onHover,
}) => {
    const [shouldDisplayShowMore, setShouldDisplayShowMore] =
        useState(isLimitEnabled)

    const headerData = ARTICLE_TEMPLATE_CATEGORIES[category]
    const tooltipId = `tooltip-${category}`

    const slicedArticles = useMemo(() => {
        if (!shouldDisplayShowMore) {
            return articles
        }

        return articles.slice(0, ARTICLE_TEMPLATE_LIMIT)
    }, [shouldDisplayShowMore, articles])

    return (
        <div className={css.articleSection}>
            <AnimatedFadeInOut isLoading={isLoading}>
                {isLoading ? (
                    <div className={css.loadingContainer}>
                        {Array(3)
                            .fill(null)
                            .map((_, index) => (
                                <Skeleton key={index} height={32} />
                            ))}
                    </div>
                ) : (
                    <>
                        <div className={css.articleCategory}>
                            {headerData?.icon && (
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.icon,
                                    )}
                                    style={{ color: headerData.icon.color }}
                                >
                                    {headerData.icon.name}
                                </i>
                            )}
                            {headerData?.label}
                            {headerData?.tooltip && (
                                <>
                                    <i
                                        className={classNames(
                                            'material-icons',
                                            css.infoIcon,
                                        )}
                                        id={tooltipId}
                                    >
                                        info_outline
                                    </i>
                                    <Tooltip
                                        placement="top-start"
                                        target={tooltipId}
                                        trigger={['hover']}
                                        autohide={false}
                                    >
                                        <div className={css.tooltipContainer}>
                                            {headerData.tooltip}
                                        </div>
                                    </Tooltip>
                                </>
                            )}
                        </div>
                        <div className={css.articleDelimiter} />
                        {slicedArticles.map((item) => (
                            <div key={item.key}>
                                <div
                                    className={css.article}
                                    onMouseEnter={() => onHover(item.key)}
                                    onMouseLeave={() => onHover(undefined)}
                                >
                                    <CheckBox
                                        value={item.key}
                                        isChecked={item.isSelected}
                                        onChange={() => onSelect(item.key)}
                                    />
                                    <div
                                        className={css.articleCheckboxContent}
                                        onClick={() => {
                                            onEdit(item.key)
                                        }}
                                        tabIndex={0}
                                        role="button"
                                    >
                                        {item.type === ArticleTemplateType.AI &&
                                        item.related_tickets_count &&
                                        item.related_tickets_count > 0 ? (
                                            <div
                                                className={
                                                    css.articleInfoContainer
                                                }
                                            >
                                                <span
                                                    className={css.articleTitle}
                                                >
                                                    {item.title}
                                                </span>
                                                <span
                                                    className={
                                                        css.articleTicketsCount
                                                    }
                                                >
                                                    {item.related_tickets_count}{' '}
                                                    tickets
                                                </span>
                                            </div>
                                        ) : (
                                            <span>{item.title}</span>
                                        )}
                                        <IconButton
                                            className={css.articleEditButton}
                                            fillStyle="ghost"
                                            size="small"
                                            onClick={() => onEdit(item.key)}
                                        >
                                            edit
                                        </IconButton>
                                    </div>
                                </div>
                                <div className={css.articleDelimiter} />
                            </div>
                        ))}
                        {shouldDisplayShowMore && (
                            <div className={css.showMoreContainer}>
                                <Button
                                    fillStyle="ghost"
                                    size="medium"
                                    onClick={() =>
                                        setShouldDisplayShowMore(false)
                                    }
                                >
                                    <ButtonIconLabel
                                        icon="double_arrow_down"
                                        iconClassName={css.shopMoreIcon}
                                    >
                                        Show More
                                    </ButtonIconLabel>
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </AnimatedFadeInOut>
        </div>
    )
}

export default ArticleSection
