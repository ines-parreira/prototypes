import { useCallbackRef } from '@gorgias/toolkit-react'

import { useInjectStyleToCandu } from 'hooks/candu/useInjectStyleToCandu'

export const OverviewView = () => {
    const [canduElements, setCanduElements] = useCallbackRef()
    useInjectStyleToCandu(canduElements)

    return (
        <div
            ref={setCanduElements}
            className="full-width"
            data-candu-id="convert-overview-view"
        ></div>
    )
}
