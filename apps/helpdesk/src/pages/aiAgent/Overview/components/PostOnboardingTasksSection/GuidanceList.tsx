import classNames from 'classnames'

import { Icon, IconSize, Skeleton, Text } from '@gorgias/axiom'

import { GuidanceArticle } from 'pages/aiAgent/types'

import { useAiAgentNavigation } from '../../../hooks/useAiAgentNavigation'

import css from './GuidanceList.less'

type Props = {
    guidanceArticles: GuidanceArticle[]
    isLoading: boolean
    shopName: string
    onDelete: (guidanceArticleId: number) => void
    onEdit: (guidanceArticleId: number) => void
}

const MAX_VISIBLE_ITEMS = 5

export const GuidanceList = ({
    guidanceArticles,
    isLoading,
    shopName,
    onDelete,
    onEdit,
}: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })

    const hasMoreThanMaxVisibleItems =
        guidanceArticles.length > MAX_VISIBLE_ITEMS
    const visibleArticles = guidanceArticles.slice(0, MAX_VISIBLE_ITEMS)

    if (isLoading) {
        return <Skeleton height={36} />
    }

    if (guidanceArticles.length === 0) {
        return null
    }

    return (
        <div className={css.container}>
            <div className={css.guidances}>
                {visibleArticles.map((article) => (
                    <div key={article.id} className={css.listItem}>
                        <Text size="md" variant="regular">
                            {article.title}
                        </Text>

                        <div className={css.actions}>
                            <span
                                className={css.actionButton}
                                onClick={() => onEdit(article.id)}
                            >
                                <Icon name="edit-pencil" />
                            </span>
                            <span
                                className={classNames(
                                    css.actionButton,
                                    css.deleteButton,
                                )}
                                onClick={() => onDelete(article.id)}
                            >
                                <Icon name="trash-empty" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {hasMoreThanMaxVisibleItems && (
                <a
                    className={css.urlLink}
                    href={routes.guidance}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Text size="sm" variant="bold">
                        View all guidance
                    </Text>
                    <Icon name="external-link" size={IconSize.Sm} />
                </a>
            )}
        </div>
    )
}
