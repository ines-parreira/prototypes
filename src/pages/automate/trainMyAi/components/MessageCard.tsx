import classnames from 'classnames'
import React from 'react'

import {Paths} from '../../../../rest_api/help_center_api/client.generated'
import useHelpCenterArticleTree from '../hooks/useHelpCenterArticleTree'
import css from './MessageCard.less'

type Props = {
    isSelected: boolean
    onSelect?: () => void
    isSuccess: boolean
    message: string
    articleTitle: string
}

const MessageCard = ({
    isSelected,
    isSuccess,
    message,
    articleTitle,
    onSelect,
}: Props) => {
    return (
        <button
            className={classnames(css.container, {
                [css.selected]: isSelected,
                [css.success]: isSuccess,
            })}
            onClick={onSelect}
        >
            <div className={css.iconContainer}>
                {isSuccess ? (
                    <i
                        className={classnames(
                            'material-icons',
                            css.successIcon
                        )}
                    >
                        check_circle
                    </i>
                ) : (
                    <i className={classnames('material-icons', css.icon)}>
                        forum
                    </i>
                )}
            </div>

            <div className={css.message}>{message}</div>
            <div className={css.articleTitle}>{articleTitle}</div>
        </button>
    )
}

export const StatefulMessageCard = ({
    helpCenterId,
    locale,
    articleId,
    ...props
}: Omit<Props, 'articleTitle'> & {
    helpCenterId: number
    articleId: number
    locale: Paths.GetCategoryTree.Parameters.Locale
}) => {
    const {map, isInitialLoading} = useHelpCenterArticleTree(
        helpCenterId,
        locale
    )

    return (
        <MessageCard
            articleTitle={
                isInitialLoading ? '' : map.get(articleId) || 'Deleted article'
            }
            {...props}
        />
    )
}

export default MessageCard
