import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import useCallbackRef from 'hooks/useCallbackRef'

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
