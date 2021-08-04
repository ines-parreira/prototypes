import React from 'react'
import classNames from 'classnames'

import {Badge, Spinner} from 'reactstrap'

import {Category} from '../../../../../../../models/helpCenter/types'

import {useModalManager} from '../../../../../../../hooks/useModalManager'

import {LanguageList} from '../../../../../../common/components/LanguageBulletList'
import BodyCell from '../../../../../../common/components/table/cells/BodyCell'
import TableBodyRow from '../../../../../../common/components/table/TableBodyRow'

import {useReorderDnD, Callbacks} from '../../../../hooks/useReorderDnD'
import {useSupportedLocales} from '../../../../providers/SupportedLocales'
import {MODALS} from '../../../../constants'

import {useArticles} from '../../../../hooks/useArticles'

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
    const categoryModal = useModalManager(MODALS.CATEGORY, {autoDestroy: false})
    const articleModal = useModalManager(MODALS.ARTICLE, {autoDestroy: false})

    const [isOpen, setOpen] = React.useState(false)
    const {articles, isLoading} = useArticles(
        category?.translation?.locale,
        category.id
    )

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
        if (isDragging) {
            setOpen(false)
        }
    }, [isDragging])

    const opacity = isDragging ? 0 : 1
    const count = React.useMemo(() => articles.length, [articles])
    const shouldCollapseRow = isOpen && articles.length > 0
    const bodyInnerClass = classNames({
        [css['no-click']]: articles.length === 0,
    })

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
                <BodyCell innerClassName={bodyInnerClass}>
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
                    innerClassName={bodyInnerClass}
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
                <BodyCell innerClassName={bodyInnerClass}>
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
                <BodyCell
                    width={120}
                    innerClassName={classNames(css.actions, bodyInnerClass)}
                >
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
            {shouldCollapseRow && renderArticleList && (
                <TableBodyRow>
                    <BodyCell colSpan={4} className={css['parent-cell']}>
                        {renderArticleList({...category, articles})}
                    </BodyCell>
                </TableBodyRow>
            )}
        </>
    )
}
