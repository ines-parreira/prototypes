import { forwardRef } from 'react'

import {
    GroupedVirtuosoProps,
    TableVirtuosoProps,
    VirtuosoProps,
} from 'react-virtuoso'

//eslint-disable-next-line @typescript-eslint/no-unused-vars
function Virtuoso(props: VirtuosoProps<unknown, unknown>, _ref: any) {
    const Header = props.components?.Header
    const Footer = props.components?.Footer
    return (
        <div style={props.style} ref={_ref}>
            {!!Header && <Header context={props.context} />}
            {props.data?.map((value, index) => (
                <div data-index={index} data-item-index={index} key={index}>
                    {props.itemContent?.(index, value, undefined)}
                </div>
            ))}
            {!!Footer && <Footer context={props.context} />}
            <div onClick={props.endReached as any}>end area</div>
        </div>
    )
}

//eslint-disable-next-line @typescript-eslint/no-unused-vars
function GroupedVirtuoso(
    props: GroupedVirtuosoProps<unknown, unknown>,
    _ref: any,
) {
    // const Header = props.components?.Header
    const Footer = props.components?.Footer
    return (
        <div style={props.style} ref={_ref}>
            {props.groupCounts &&
                Array.from(props.groupCounts).map(
                    (_, index) =>
                        props.groupContent && (
                            <div key={index}>
                                {props.groupContent(index, props.context)}
                            </div>
                        ),
                )}
            {props.groupCounts &&
                getRowsFromGroupCounts(props.groupCounts).map(
                    ([groupIndex, itemIndex]) =>
                        props.itemContent && (
                            <div
                                key={`${groupIndex}-${itemIndex}`}
                                data-item-index={itemIndex}
                            >
                                {props.itemContent(
                                    itemIndex,
                                    groupIndex,
                                    undefined,
                                    {},
                                )}
                            </div>
                        ),
                )}
            {Footer && <Footer context={props.context} />}
            <div onClick={props.endReached as any}>end area</div>
        </div>
    )
}

const getRowsFromGroupCounts = (groupCounts: number[]) => {
    const sum = groupCounts.reduce((acc, item) => acc + item, 0)

    return Array.from({ length: sum }, (_, index) => index).map<
        [number, number]
    >((itemIndex) => [0, itemIndex])
}

//eslint-disable-next-line @typescript-eslint/no-unused-vars
function TableVirtuoso(props: TableVirtuosoProps<unknown, unknown>, _ref: any) {
    const TableHead = props.components?.TableHead
    const fixedHeaderContent = props.fixedHeaderContent
    const TableRow = props.components?.TableRow
    const EmptyPlaceholder = props.components?.EmptyPlaceholder

    return (
        <table style={props.style} ref={_ref}>
            {props.data?.length === 0 && !!EmptyPlaceholder && (
                <EmptyPlaceholder context={props.context} />
            )}
            {!!fixedHeaderContent && !!TableHead && (
                // @ts-expect-error
                <TableHead>{fixedHeaderContent()}</TableHead>
            )}
            {props.data?.map((value, index) => {
                return !!TableRow ? (
                    <TableRow
                        data-index={index}
                        data-item-index={index}
                        key={index}
                        data-known-size={0}
                        item={value}
                        context={props.context}
                    >
                        {props.itemContent?.(index, value, undefined)}
                    </TableRow>
                ) : (
                    <tr data-index={index} data-item-index={index} key={index}>
                        {props.itemContent?.(index, value, undefined)}
                    </tr>
                )
            })}
            <div onClick={props.endReached as any}>end area</div>
        </table>
    )
}

const mockedVirtuoso = {
    Virtuoso: forwardRef(Virtuoso),
    GroupedVirtuoso: forwardRef(GroupedVirtuoso),
    TableVirtuoso: forwardRef(TableVirtuoso),
}

export default mockedVirtuoso
