import React from 'react'
import classNames from 'classnames'

import {Badge, Spinner} from 'reactstrap'

import {
    HelpCenterArticle,
    Category,
} from '../../../../../../../models/helpCenter/types'

import {useModalManager} from '../../../../../../../hooks/useModalManager'

import {LanguageList} from '../../../../../../common/components/LanguageBulletList'
import BodyCell from '../../../../../../common/components/table/cells/BodyCell'
import TableBodyRow from '../../../../../../common/components/table/TableBodyRow'

import {useReorderDnD, Callbacks} from '../../../../hooks/useReorderDnD'
import {useSupportedLocales} from '../../../../providers/SupportedLocales'
import {HELP_CENTER_LANGUAGE_DEFAULT, MODALS} from '../../../../constants'

import {useHelpcenterApi} from '../../../../hooks/useHelpcenterApi'
import {useHelpCenterIdParam} from '../../../../hooks/useHelpCenterIdParam'

import {TableActions} from '../../../TableActions'

import {DND_ENTITIES} from '../../constants'

import css from './DroppableCategoryRow.less'

export type RowEventListeners = {
    onRowClick?: () => void
    onMoveEntity: Callbacks['onHover']
    onDropEntity?: Callbacks['onDrop']
}

type Props = RowEventListeners & {
    category: Category
    renderArticleList?: (category: Category) => React.ReactElement
}

export const DroppableCategoryRow = ({
    category,
    renderArticleList,
    onRowClick,
    onMoveEntity,
    onDropEntity,
}: Props): JSX.Element => {
    const categoryModal = useModalManager(MODALS.CATEGORY)
    const articleModal = useModalManager(MODALS.ARTICLE)

    const helpCenterId = useHelpCenterIdParam()
    const [isOpen, setOpen] = React.useState(false)
    // const [locales, setLocales] = React.useState<LocaleCode[]>([])
    const [isLoading, setLoading] = React.useState(true)
    const [articles, setArticles] = React.useState<HelpCenterArticle[]>([])

    const {isReady, client} = useHelpcenterApi()
    const localesByCode = useSupportedLocales()

    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position: category.position,
            id: category.id,
            type: DND_ENTITIES.CATEGORY,
        },
        [DND_ENTITIES.CATEGORY],
        {onHover: onMoveEntity, onDrop: onDropEntity}
    )

    React.useEffect(() => {
        async function init() {
            if (isReady && client) {
                // TODO: uncomment this when we will support more locales
                // const translations = await client
                //     .listCategoryTranslations({
                //         help_center_id: 1,
                //         category_id: category.id,
                //     })
                //     .then((response) => response.data.data)
                //     .then((response) =>
                //         response.map((translation) => translation.locale)
                //     )

                // TODO: Extract this as custom hook
                const articlesResponse = await client
                    .listCategoryArticles({
                        help_center_id: helpCenterId,
                        category_id: category.id,
                        locale: category?.translation
                            ? category?.translation.locale
                            : HELP_CENTER_LANGUAGE_DEFAULT,
                    })
                    .then((response) => response.data.data)

                const positionsResponse = await client
                    .getCategoryArticlesPositions({
                        help_center_id: helpCenterId,
                        category_id: category.id,
                    })
                    .then((response) => response.data)

                const articles = articlesResponse.map((article) => ({
                    ...article,
                    position: positionsResponse.findIndex(
                        (index) => index === article.id
                    ),
                }))

                setArticles(articles)
                // setLocales(translations)
                setLoading(false)
            }
        }

        void init()
    }, [isReady, category.id])

    React.useEffect(() => {
        if (isDragging) {
            setOpen(false)
        }
    }, [isDragging])

    const opacity = isDragging ? 0 : 1
    const count = React.useMemo(() => articles.length, [articles])

    const handleOnActionClick = (ev: React.MouseEvent, name: string) => {
        if (name === 'categorySettings') {
            categoryModal.openModal(MODALS.CATEGORY, true, category)
            return
        }

        if (name === 'createInCategory') {
            articleModal.openModal(MODALS.ARTICLE, true, {
                categoryId: category.id,
            })
            return
        }
    }

    let countElement = (
        <Spinner size="sm" color="secondary" style={{marginLeft: 8}} />
    )

    if (!isLoading) {
        countElement = (
            <Badge pill color="light" className={css.count}>
                {count > 0 ? count : 'No Published Articles'}
            </Badge>
        )
    }
    return (
        <>
            <TableBodyRow
                ref={dropRef as React.Ref<HTMLTableRowElement>}
                data-handler-id={handlerId}
                className={css.row}
                style={{opacity}}
                onClick={onRowClick}
            >
                <BodyCell>
                    <div
                        ref={dragRef as React.RefObject<HTMLDivElement>}
                        className={classNames(
                            css['drag-handler'],
                            'material-icons'
                        )}
                    >
                        drag_indicator
                    </div>
                </BodyCell>
                <BodyCell
                    className={css['category-cell']}
                    onClick={() => setOpen(!isOpen)}
                >
                    {count > 0 && renderArticleList ? (
                        <span
                            className={classNames(css.caret, 'material-icons')}
                        >
                            {isOpen ? 'arrow_drop_down' : 'arrow_right'}
                        </span>
                    ) : (
                        <span className={css['caret-placeholder']} />
                    )}
                    {category.translation && (
                        <span>{category.translation.title}</span>
                    )}
                    {countElement}
                </BodyCell>
                <BodyCell>
                    {
                        // isLoading ? (
                        //     <Spinner size="sm" color="secondary" />
                        // ) : (
                        category.translation && (
                            <LanguageList
                                helpcenterId={category.id}
                                defaultLanguage={
                                    localesByCode[category.translation.locale]
                                }
                                languageList={[
                                    localesByCode[category.translation.locale],
                                ]}
                                // TODO: uncomment this when we will support more locales
                                // languageList={locales.map(
                                //     (code) => localesByCode[code as string]
                                // )}
                            />
                        )
                        // )
                    }
                </BodyCell>
                <BodyCell width={120} innerClassName={css.actions}>
                    <TableActions
                        actions={[
                            {
                                name: 'createInCategory',
                                icon: 'add_circle_outline',
                                // tooltip: 'Compose article in category',
                            },
                            {
                                name: 'categorySettings',
                                icon: 'settings',
                                // tooltip: 'Category settings',
                            },
                        ]}
                        onClick={handleOnActionClick}
                    />
                </BodyCell>
            </TableBodyRow>
            {isOpen && renderArticleList && (
                <TableBodyRow>
                    <BodyCell colSpan={4} className={css['parent-cell']}>
                        {renderArticleList({...category, articles})}
                    </BodyCell>
                </TableBodyRow>
            )}
        </>
    )
}
