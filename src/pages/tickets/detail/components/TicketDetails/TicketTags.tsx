import React, {useContext, useMemo, useState} from 'react'
import type {ComponentProps} from 'react'
import classnames from 'classnames'
import {List, Map} from 'immutable'
import {Badge, DropdownMenu} from 'reactstrap'

import {getElementWrapInfo} from 'common/utils'
import useCallbackRef from 'hooks/useCallbackRef'
import useElementSize from 'hooks/useElementSize'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import TicketTag from 'pages/common/components/TicketTag'
import Tooltip from 'pages/common/components/Tooltip'
import ThemeContext from 'theme/ThemeContext'

import TagSearchDropdown from './TagSearchDropdown'
import css from './TicketTags.less'

type Props = {
    addTag: (tag: string) => void
    className?: string
    dropdownContainer?: ComponentProps<typeof DropdownMenu>['container']
    isDisabled?: boolean
    removeTag: (tag: string) => void
    right?: boolean
    shouldBindKeys?: boolean
    ticketTags: List<Map<any, any>>
    transparent?: boolean
}

const TicketTags = ({
    addTag,
    className,
    dropdownContainer,
    isDisabled = false,
    removeTag,
    right = false,
    shouldBindKeys = false,
    ticketTags,
    transparent = false,
}: Props) => {
    const tags = useMemo(
        () =>
            ticketTags.sort((a: Map<any, any>, b: Map<any, any>) => {
                const first = (a.get('name') as string).toLowerCase()
                const second = (b.get('name') as string).toLowerCase()

                return first > second ? 1 : second > first ? -1 : 0
            }),
        [ticketTags]
    )
    const themeContext = useContext(ThemeContext)
    const [showAllTags, setShowAllTags] = useState(false)

    const [element, setElement] = useCallbackRef()
    const [totalWidth, height] = useElementSize(element)

    const wrapInfo = useMemo(() => {
        if (!element || !totalWidth || !tags.size) return null
        return getElementWrapInfo(element.children)
    }, [element, tags, totalWidth])

    const hiddenTags = useMemo(
        () =>
            wrapInfo
                ? tags
                      .slice(tags.size - (wrapInfo.wrappedElementCount - 1))
                      .map((tag) => tag?.get('name') as string)
                : undefined,
        [tags, wrapInfo]
    )

    const derivedShowAllTags = useMemo(
        () =>
            showAllTags
                ? !!wrapInfo && wrapInfo?.wrappedElementCount > 1
                : false,
        [showAllTags, wrapInfo]
    )

    return (
        <div
            className={css.wrapper}
            style={{
                height: showAllTags ? height : 24,
            }}
        >
            <div className={css.row}>
                <div
                    ref={setElement}
                    className={classnames(
                        css.tags,
                        {
                            [css.right]: right,
                        },
                        className
                    )}
                >
                    {!isDisabled && (
                        <TagSearchDropdown
                            addTag={addTag}
                            dropdownContainer={dropdownContainer}
                            shouldBindKeys={shouldBindKeys}
                            ticketTags={ticketTags}
                            transparent={transparent}
                        />
                    )}
                    {tags.map((tag?: Map<any, any>, i?) => (
                        <TicketTag
                            key={i}
                            decoration={tag!.get('decoration')}
                            className={css.tagLabel}
                        >
                            <span>
                                {tag!.get('name')}
                                {!isDisabled && (
                                    <i
                                        className={classnames(
                                            css.remove,
                                            'material-icons cursor-pointer ml-1'
                                        )}
                                        onClick={() =>
                                            removeTag(
                                                tag!.get('name') as string
                                            )
                                        }
                                    >
                                        close
                                    </i>
                                )}
                            </span>
                        </TicketTag>
                    ))}
                    <Button
                        fillStyle="ghost"
                        size="small"
                        onClick={() => setShowAllTags(!showAllTags)}
                        className={classnames({
                            [css.hidden]: !derivedShowAllTags,
                        })}
                    >
                        <ButtonIconLabel
                            className={css.button}
                            position="right"
                            icon="expand_less"
                        >
                            Show less
                        </ButtonIconLabel>
                    </Button>
                </div>
                {!showAllTags && wrapInfo && wrapInfo.wrappedElementCount > 1 && (
                    <>
                        <Badge
                            id="expand-tags-badge"
                            className={classnames('badge-tag', css.displayMore)}
                            style={{
                                color: themeContext?.colorTokens.Neutral.Grey_6
                                    .value,
                                backgroundColor:
                                    themeContext?.colorTokens.Neutral.Grey_3
                                        .value,
                                left: `${
                                    (wrapInfo?.width ?? 0) - totalWidth
                                }px`,
                            }}
                            onClick={() => setShowAllTags(!showAllTags)}
                        >
                            <span>
                                + {wrapInfo.wrappedElementCount - 1}
                                <i
                                    className={classnames(
                                        'material-icons material-icons-round',
                                        css.icon
                                    )}
                                >
                                    arrow_drop_down
                                </i>
                            </span>
                        </Badge>
                        <Tooltip
                            target="expand-tags-badge"
                            offset="0, 9"
                            placement="bottom-start"
                            fade={false}
                        >
                            <ul className={css.tooltipContent}>
                                {hiddenTags?.map((tag) => (
                                    <li key={tag}>{tag}</li>
                                ))}
                            </ul>
                        </Tooltip>
                    </>
                )}
            </div>
        </div>
    )
}

export default TicketTags
