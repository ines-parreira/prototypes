import { PhoneIntegrationCallBar } from './PhoneIntegrationCallBar'
import { WrapUpCallBar } from './WrapUpCallBar'

export function PhoneIntegrationBar(): JSX.Element | null {
    return (
        <>
            <PhoneIntegrationCallBar />
            <WrapUpCallBar />
        </>
    )
}
