import {Tooltip} from '@gorgias/ui-kit'
import classnames from 'classnames'
import {List, Map} from 'immutable'
import _uniqueId from 'lodash/uniqueId'
import React, {ComponentProps, useMemo, useState} from 'react'

import {getElementWrapInfo} from 'common/utils'
import useCallbackRef from 'hooks/useCallbackRef'
import useElementSize from 'hooks/useElementSize'
import Badge, {BadgeIcon, ColorType} from 'pages/common/components/Badge'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import TicketTag from 'pages/common/components/TicketTag'

import TagDropdown from './TagDropdown'
import css from './TicketTags.less'

type Props = {
    addTag?: (tag: string) => void
    className?: string
    isDisabled?: boolean
    removeTag?: (tag: string) => void
    right?: boolean
    shouldBindKeys?: boolean
    ticketTags: List<Map<any, any>>
    transparent?: boolean
} & Pick<ComponentProps<typeof TicketTag>, 'textClassName'>

const TicketTags = ({
    addTag,
    className,
    isDisabled = false,
    removeTag,
    right = false,
    shouldBindKeys = false,
    ticketTags,
    textClassName,
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

    const uniqueId = useMemo(() => _uniqueId(), [])

    const [showAllTags, setShowAllTags] = useState(false)

    const [element, setElement] = useCallbackRef()
    const [totalWidth, height] = useElementSize(element)

    const getWrappedElementCount = () => {
        if (!element || !totalWidth || !tags.size) return 0
        return getElementWrapInfo(element.children, totalWidth)
    }
    const wrappedElementCount = getWrappedElementCount()

    const getHiddenTags = () =>
        wrappedElementCount
            ? tags
                  .slice(tags.size - wrappedElementCount)
                  .map((tag) => tag?.get('name') as string)
            : []
    const hiddenTags = getHiddenTags()

    const derivedShowAllTags = useMemo(
        () =>
            showAllTags
                ? wrappedElementCount && wrappedElementCount > 0
                : false,
        [showAllTags, wrappedElementCount]
    )

    let formula = right ? -1 : Number.MAX_SAFE_INTEGER
    if (wrappedElementCount) {
        formula = (ticketTags.size - wrappedElementCount) * 10 - 5

        // keep the badge to the right if all tags are hidden
        if (formula < 0 && !right) {
            formula = 0
        }
    }

    const expandBadgeDisplay =
        !showAllTags && wrappedElementCount && wrappedElementCount > 0
            ? 'flex'
            : 'none'

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
                        <TagDropdown
                            addTag={({name}) => addTag?.(name!)}
                            shouldBindKeys={shouldBindKeys}
                            ticketTags={ticketTags}
                            transparent={transparent}
                        />
                    )}
                    {tags.map((tag?: Map<any, any>, i?) => (
                        <div
                            key={i}
                            style={{
                                order: (i || 0) * 10 + 1,
                            }}
                        >
                            <TicketTag
                                decoration={tag!.get('decoration')}
                                text={tag!.get('name')}
                                textClassName={textClassName}
                                {...(!isDisabled && {
                                    trailIcon: (
                                        <i className="material-icons">close</i>
                                    ),
                                    onTrailIconClick: () =>
                                        removeTag?.(tag!.get('name') as string),
                                })}
                            />
                        </div>
                    ))}
                    <div
                        style={{
                            order: formula,
                            display: expandBadgeDisplay,
                        }}
                    >
                        <Badge
                            id={`expand-tags-badge-${uniqueId}`}
                            className={css.displayMore}
                            type={ColorType.LightDark}
                            corner="square"
                            upperCase={false}
                            onClick={() => setShowAllTags(!showAllTags)}
                        >
                            + {wrappedElementCount || 0}
                            {!isDisabled && (
                                <BadgeIcon
                                    className={classnames(
                                        'material-icons-round',
                                        css.displayMoreIcon
                                    )}
                                    icon="arrow_drop_down"
                                />
                            )}
                        </Badge>
                        <Tooltip
                            target={`expand-tags-badge-${uniqueId}`}
                            offset="0, 9"
                            placement="bottom-start"
                            innerProps={{
                                fade: false,
                            }}
                        >
                            <ul className={css.tooltipContent}>
                                {hiddenTags?.map((tag) => (
                                    <li key={tag}>{tag}</li>
                                ))}
                            </ul>
                        </Tooltip>
                    </div>

                    <Button
                        fillStyle="ghost"
                        size="small"
                        onClick={() => setShowAllTags(!showAllTags)}
                        className={classnames({
                            [css.hidden]: !derivedShowAllTags,
                        })}
                        style={{order: (tags.size + 1) * 10}}
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
            </div>
        </div>
    )
}

export default TicketTags
