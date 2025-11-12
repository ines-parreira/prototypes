import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { AIArticle } from 'models/helpCenter/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import IconButton from 'pages/common/components/button/IconButton'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isAdmin } from 'utils'

import AIArticlesLibraryPreviewEmptyState from './AIArticlesLibraryPreviewEmptyState'

import css from './AIArticlesLibraryPreview.less'

const editIconId = 'article-preview-edit-icon'

type Props = {
    article?: AIArticle
    onArchive: (article: AIArticle) => void
    onPublish: (article: AIArticle) => void
    onEdit: (article: AIArticle) => void
}

const AIArticlesLibraryPreview: React.FC<Props> = ({
    article,
    onArchive,
    onPublish,
    onEdit,
}) => {
    const currentUser = useAppSelector(getCurrentUser)
    const isUserAdmin = isAdmin(currentUser)

    if (article === undefined) {
        return <AIArticlesLibraryPreviewEmptyState />
    }

    return (
        <div className={css.container}>
            {isUserAdmin ? (
                <Alert icon type={AlertType.Warning} className={css.alert}>
                    You may already have an existing article addressing this
                    topic. Double check before publishing this article.
                </Alert>
            ) : (
                <Alert icon type={AlertType.Info} className={css.alert}>
                    <b>Read-only:</b> Upgrade to an Admin role to edit and
                    publish articles.
                </Alert>
            )}
            <div className={css.header}>
                <div className={css.title}>Article Preview</div>
                {isUserAdmin && (
                    <div className={css.actions}>
                        <IconButton
                            id={editIconId}
                            intent="secondary"
                            fillStyle="ghost"
                            className={classNames(
                                'material-icons',
                                'rounded',
                                css.iconEdit,
                            )}
                            onClick={() => {
                                logEvent(
                                    SegmentEvent.HelpCenterAILibraryEditButtonClicked,
                                    {
                                        ml_key: article.key,
                                    },
                                )
                                onEdit(article)
                            }}
                        >
                            edit
                        </IconButton>
                        <Tooltip target={editIconId}>Edit</Tooltip>
                        <Button
                            intent="secondary"
                            onClick={() => {
                                logEvent(
                                    SegmentEvent.HelpCenterAILibraryArchiveButtonClicked,
                                    {
                                        ml_key: article.key,
                                    },
                                )
                                onArchive(article)
                            }}
                        >
                            Archive
                        </Button>
                        <Button
                            intent="primary"
                            onClick={() => {
                                logEvent(
                                    SegmentEvent.HelpCenterAILibraryPublishButtonClicked,
                                )
                                onPublish(article)
                            }}
                        >
                            Publish
                        </Button>
                    </div>
                )}
            </div>
            <div className={css.descriptionContainer}>
                <h3>{article.title}</h3>
                <div
                    className={css.description}
                    dangerouslySetInnerHTML={{
                        __html: article.html_content,
                    }}
                />
            </div>
        </div>
    )
}

export default AIArticlesLibraryPreview
