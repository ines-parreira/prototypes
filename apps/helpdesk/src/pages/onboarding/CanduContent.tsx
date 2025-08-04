import { useCallbackRef } from '@repo/hooks'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'

import PageHeader from '../common/components/PageHeader'

type Props = {
    title: string
    containerId: string
}

export const CanduContent = ({ title, containerId }: Props) => {
    const [ref, setRef] = useCallbackRef()

    useInjectStyleToCandu(ref)

    return (
        <div className="full-width">
            <PageHeader title={title} />
            <div id={containerId} ref={setRef} style={{ padding: '0 20px' }} />
        </div>
    )
}

export default CanduContent
