import type { MouseEvent, ReactNode } from 'react'
import { useContext, useEffect } from 'react'

import { isMacOs } from '@repo/utils'
import classnames from 'classnames'
import { Link, useHistory } from 'react-router-dom'

import type { EntityType } from 'hooks/useSearchRankScenario'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import css from 'pages/common/components/Spotlight/SpotlightRow.less'
import { sanitizeHtmlDefault } from 'utils/html'

type SpotlightRowProps = {
    icon?: ReactNode
    title: string
    info: ReactNode
    link: string
    onCloseModal: () => void
    selected?: boolean
    shrinkInfo?: boolean
    id: number
    index: number
    onClick?: (e: MouseEvent) => void
    message?: string
    entityId?: string
    entityType: EntityType
}

const SpotlightRow = ({
    title,
    info,
    link,
    icon,
    onCloseModal,
    selected = false,
    shrinkInfo = false,
    id,
    index,
    onClick,
    message,
    entityId,
    entityType,
}: SpotlightRowProps) => {
    const searchRank = useContext(SearchRankScenarioContext)
    const history = useHistory()
    useEffect(() => {
        if (selected) {
            return history.listen((location, action) => {
                if (
                    selected &&
                    action === 'PUSH' &&
                    location.pathname === link
                ) {
                    searchRank?.registerResultSelection({
                        id,
                        index,
                        type: entityType,
                    })
                }
            })
        }
    }, [entityType, history, id, index, link, searchRank, selected])

    const handleClick = (e: MouseEvent) => {
        onClick?.(e)
        searchRank?.registerResultSelection({ id, index, type: entityType })
        if (isMacOs ? !e.metaKey : !e.ctrlKey) {
            onCloseModal()
        }
    }

    return (
        <Link
            className={classnames(css.container, {
                [css.selected]: selected,
                [css.shrinkInfo]: shrinkInfo,
            })}
            to={link}
            onClick={handleClick}
        >
            <div className={css.infoContent}>
                <div className={css.infoHeader}>
                    {!!icon && <div className={css.icon}>{icon}</div>}
                    <span
                        className={css.title}
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlDefault(title),
                        }}
                    />
                    <div className={css.separator} />
                    <span className={css.info}>{info}</span>
                    {selected && (
                        <ShortcutIcon
                            className={css.arrowIcon}
                            fillStyle="ghost"
                        >
                            ↩
                        </ShortcutIcon>
                    )}
                </div>
                {message && (
                    <div
                        className={classnames(css.infoFooter, {
                            [css.indented]: !!icon,
                        })}
                    >
                        <span
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtmlDefault(message),
                            }}
                        />
                    </div>
                )}
                {entityId && (
                    <div
                        className={classnames(css.infoFooter, {
                            [css.indented]: !!icon,
                        })}
                    >
                        <span
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtmlDefault(entityId),
                            }}
                        />
                    </div>
                )}
            </div>
        </Link>
    )
}

export default SpotlightRow
