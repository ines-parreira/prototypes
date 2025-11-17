import type { LocaleCode } from 'models/helpCenter/types'
import HelpCenterEditor from 'pages/settings/helpCenter/components/articles/HelpCenterEditor/HelpCenterEditor'
import { EDITOR_MODAL_CONTAINER_ID } from 'pages/settings/helpCenter/constants'

import css from './KnowledgeEditorHelpCenterArticleEditView.less'

type Props = {
    locale: LocaleCode
    articleId?: number
    content: string
    onChangeContent: (content: string) => void
}

export const KnowledgeEditorHelpCenterArticleEditView = ({
    locale,
    articleId,
    content,
    onChangeContent,
}: Props) => (
    <div className={css.container}>
        <div id={EDITOR_MODAL_CONTAINER_ID}>
            <HelpCenterEditor
                locale={locale}
                articleId={articleId}
                value={content}
                onChange={onChangeContent}
                useXSLayout={false}
                className={css.editor}
            />
        </div>
    </div>
)
