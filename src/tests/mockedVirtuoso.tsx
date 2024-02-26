import {VirtuosoProps} from 'react-virtuoso'
import React, {forwardRef} from 'react'

//eslint-disable-next-line @typescript-eslint/no-unused-vars
function Virtuoso(props: VirtuosoProps<unknown, unknown>, _ref: any) {
    const Header = props.components?.Header
    const Footer = props.components?.Footer
    return (
        <div style={props.style} ref={_ref}>
            {!!Header && <Header context={props.context} />}
            {props.data?.map((value, index) => (
                <div data-index={index} key={index}>
                    {props.itemContent?.(index, value, undefined)}
                </div>
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
