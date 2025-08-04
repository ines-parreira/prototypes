import { useCallbackRef } from '@repo/hooks'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'

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
