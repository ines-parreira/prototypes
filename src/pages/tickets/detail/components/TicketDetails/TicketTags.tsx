import React, {useContext, useMemo, useState} from 'react'
import type {ComponentProps} from 'react'
import classnames from 'classnames'
import {List, Map} from 'immutable'
import {Badge, DropdownMenu} from 'reactstrap'

import useElementSize from 'hooks/useElementSize'
import useHasWrapped from 'hooks/useHasWrapped'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Tooltip from 'pages/common/components/Tooltip'
import {TagLabel} from 'pages/common/utils/labels'
import ThemeContext from 'theme/ThemeContext'

import TicketTagDropdown from './TicketTagDropdown'
import css from './TicketTags.less'

type Props = {
    addTag: (tag: string) => void
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
    dropdownContainer,
    isDisabled = false,
    removeTag,
    right = false,
    shouldBindKeys = false,
    ticketTags,
    transparent = false,
}: Props) => {
    const [showAllTags, setShowAllTags] = useState(false)
    const {
        ref,
        hasWrapped,
        numberOfWrappedElements,
        width: tagsWidth,
    } = useHasWrapped<HTMLDivElement>()
    const [width, height] = useElementSize(ref.current)
    const themeContext = useContext(ThemeContext)

    const numberOfHiddenTags = numberOfWrappedElements! - 1

    const tags = ticketTags.sort((a: Map<any, any>, b: Map<any, any>) => {
        const first = (a.get('name') as string).toLowerCase()
        const second = (b.get('name') as string).toLowerCase()

        return first > second ? 1 : second > first ? -1 : 0
    })

    const hiddenTagsList = useMemo(
        () =>
            tags
                .slice(tags.size - numberOfHiddenTags)
                .map((tag) => tag?.get('name') as string),
        [numberOfHiddenTags, tags]
    )

    return (
        <>
            <div
                className={css.wrapper}
                style={{
                    height: showAllTags ? height : 24,
                }}
            >
                <div className={css.tagsRow}>
                    <div
                        ref={ref}
                        className={classnames(css.tags, {
                            [css.right]: right,
                        })}
                    >
                        {!isDisabled && (
                            <TicketTagDropdown
                                addTag={addTag}
                                dropdownContainer={dropdownContainer}
                                right={right}
                                shouldBindKeys={shouldBindKeys}
                                ticketTags={ticketTags}
                                transparent={transparent}
                            />
                        )}
                        {tags.map((tag?: Map<any, any>, i?) => (
                            <TagLabel
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
                            </TagLabel>
                        ))}
                        {hasWrapped && (
                            <Button
                                fillStyle="ghost"
                                size="small"
                                onClick={() => setShowAllTags(!showAllTags)}
                            >
                                <ButtonIconLabel
                                    className={css.button}
                                    position="right"
                                    icon="expand_less"
                                >
                                    Show less
                                </ButtonIconLabel>
                            </Button>
                        )}
                    </div>
                    {hasWrapped && numberOfWrappedElements! > 1 && (
                        <>
                            <Badge
                                id="expand-tags-badge"
                                className={classnames(
                                    'badge-tag',
                                    css.displayMore,
                                    {
                                        [css.hidden]: showAllTags,
                                    }
                                )}
                                style={{
                                    color: themeContext?.colorTokens.Neutral
                                        .Grey_6.value,
                                    backgroundColor:
                                        themeContext?.colorTokens.Neutral.Grey_3
                                            .value,
                                    left: `${(tagsWidth ?? 0) - width}px`,
                                }}
                                onClick={() => setShowAllTags(!showAllTags)}
                            >
                                <span>
                                    + {numberOfHiddenTags}
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
                                    {hiddenTagsList.map((tag) => (
                                        <li key={tag}>{tag}</li>
                                    ))}
                                </ul>
                            </Tooltip>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default TicketTags
