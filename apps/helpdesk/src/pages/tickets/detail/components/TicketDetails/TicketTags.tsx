import { ComponentProps, Fragment, useEffect, useMemo, useState } from 'react'

import { useCallbackRef, useElementSize } from '@repo/hooks'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'

import {
    Badge,
    BadgeIcon,
    LegacyButton as Button,
    Tooltip,
} from '@gorgias/axiom'
import { Tag, TicketTag as TicketTagType } from '@gorgias/helpdesk-types'

import { getWrappedElementCount } from 'common/utils'
import TicketTag from 'pages/common/components/TicketTag'

import TagDropdown from './TagDropdown'

import css from './TicketTags.less'

type Props = {
    addTag?: (tag: Tag) => void
    className?: string
    disableTagCreation?: boolean
    isDisabled?: boolean
    removeTag?: (tag: string) => void
    right?: boolean
    shouldBindKeys?: boolean
    ticketTags: TicketTagType[]
    transparent?: boolean
} & Pick<ComponentProps<typeof TicketTag>, 'textClassName'>

const TicketTags = ({
    addTag,
    className,
    disableTagCreation = false,
    isDisabled = false,
    removeTag,
    right = false,
    shouldBindKeys = false,
    ticketTags,
    textClassName,
    transparent = false,
}: Props) => {
    const [wrappedElementCount, setWrapperElementCount] = useState(0)
    const tags = useMemo(
        () =>
            ticketTags.sort((a, b) => {
                const first = a.name.toLowerCase()
                const second = b.name.toLowerCase()

                return first > second ? 1 : second > first ? -1 : 0
            }),
        [ticketTags],
    )

    const uniqueId = useMemo(() => _uniqueId(), [])

    const [isExpanded, setExpanded] = useState(false)

    const [element, setElement] = useCallbackRef()
    const [width, height] = useElementSize(element)

    // make sure we do the wrapping count after the first render
    useEffect(() => {
        setWrapperElementCount(getWrappedElementCount(element, ['button']))
    }, [element, width, height, isExpanded, ticketTags.length])

    const hiddenTags = wrappedElementCount
        ? tags.slice(tags.length - wrappedElementCount).map((tag) => tag?.name)
        : []

    const displayExpandButton = Boolean(
        !isExpanded && wrappedElementCount && wrappedElementCount > 0,
    )

    const displayShowLessButton = wrappedElementCount > 0 && isExpanded

    return (
        <div
            className={css.wrapper}
            style={{
                height: isExpanded ? height : 24,
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
                        className,
                    )}
                >
                    {!isDisabled && (
                        <TagDropdown
                            addTag={(tag) => addTag?.(tag as Tag)}
                            disableTagCreation={disableTagCreation}
                            shouldBindKeys={shouldBindKeys}
                            ticketTags={ticketTags}
                            transparent={transparent}
                        />
                    )}
                    {tags.map((tag, i) => (
                        <Fragment key={tag.name}>
                            {wrappedElementCount > 0 &&
                                tags.length - i === wrappedElementCount &&
                                displayExpandButton && (
                                    <div>
                                        <Badge
                                            id={`expand-tags-badge-${uniqueId}`}
                                            className={css.displayMore}
                                            type={'light-dark'}
                                            corner="square"
                                            upperCase={false}
                                            onClick={() => setExpanded(true)}
                                        >
                                            + {wrappedElementCount || 0}
                                            {!isDisabled && (
                                                <BadgeIcon
                                                    className={classnames(
                                                        'material-icons-round',
                                                        css.displayMoreIcon,
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
                                )}
                            <TicketTag
                                key={i}
                                decoration={tag.decoration}
                                text={tag.name}
                                textClassName={textClassName}
                                {...(!isDisabled && {
                                    trailIcon: (
                                        <i className="material-icons">close</i>
                                    ),
                                    onTrailIconClick: () =>
                                        removeTag?.(tag.name),
                                })}
                            />
                        </Fragment>
                    ))}
                    {displayShowLessButton && (
                        <Button
                            fillStyle="ghost"
                            size="small"
                            onClick={() => setExpanded(false)}
                            trailingIcon="expand_less"
                        >
                            Show less
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TicketTags
