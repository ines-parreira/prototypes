import {VirtuosoProps} from 'react-virtuoso'
import React, {forwardRef, Fragment} from 'react'

//eslint-disable-next-line @typescript-eslint/no-unused-vars
function Virtuoso(props: VirtuosoProps<unknown, unknown>, _ref: any) {
    const Footer = props.components?.Footer
    return (
        <div style={props.style}>
            {props.data?.map((value, index) => (
                <Fragment key={index}>
                    {props.itemContent?.(index, value, undefined)}
                </Fragment>
            ))}
            {!!Footer && <Footer context={props.context} />}
            <div onClick={props.endReached as any}>end area</div>
        </div>
    )
}

const mockedVirtuoso = {
    Virtuoso: forwardRef(Virtuoso),
}

export default mockedVirtuoso
