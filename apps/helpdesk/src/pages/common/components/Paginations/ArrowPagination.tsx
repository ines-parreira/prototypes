import { PaginationItem } from './components/PaginationItem'
import { NavigationSize } from './types/NavigationSize'

import css from './style.less'

type Props = {
    /**
     * The custom CSS class name of the list element.
     */
    className?: string

    /**
     * The custom CSS class name of the item element.
     */
    classNameItem?: string

    /**
     * Either the previous button page is disabled or not.
     */
    isPreviousDisabled?: boolean

    /**
     * Either the next button page is disabled or not.
     */
    isNextDisabled?: boolean

    /**
     * The ID of the previous item.
     */
    previousItemId?: string

    /**
     * The ID of the next item.
     */
    nextItemId?: string

    /**
     * The size of the component.
     * @default 'medium'
     */
    size?: NavigationSize

    /**
     * Callback fired when the page is changed to the previous.
     */
    onClickPrevious: () => void

    /**
     *  Callback fired when the page is changed to the next.
     * */
    onClickNext: () => void
}

export const ArrowPagination = ({
    className,
    classNameItem,
    isPreviousDisabled,
    isNextDisabled,
    previousItemId,
    nextItemId,
    size,
    onClickPrevious,
    onClickNext,
}: Props) => {
    return (
        <div className={className}>
            <ul className={css.container}>
                <PaginationItem
                    className={classNameItem}
                    disabled={isPreviousDisabled}
                    itemId={previousItemId}
                    page={null}
                    size={size}
                    type="previous"
                    onClick={onClickPrevious}
                />
                <PaginationItem
                    className={classNameItem}
                    disabled={isNextDisabled}
                    itemId={nextItemId}
                    page={null}
                    size={size}
                    type="next"
                    onClick={onClickNext}
                />
            </ul>
        </div>
    )
}
