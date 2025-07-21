import React, { ComponentProps, ComponentType, ReactNode } from 'react'

import useHasCanduContent from 'hooks/candu/useHasCanduContent'

import PageHeader from '../PageHeader'

type Props = {
    title: string
    canduId: string
    children: ReactNode
}

const CanduPaywall = ({ title, canduId, children }: Props) => {
    const { ref, hasCanduContent } = useHasCanduContent<HTMLDivElement>(canduId)

    return (
        <>
            <div
                className="full-width"
                style={hasCanduContent ? undefined : { display: 'none' }}
            >
                <PageHeader title={title} />
                <div
                    ref={ref}
                    className="container-fluid"
                    data-candu-id={canduId}
                />
            </div>
            {!hasCanduContent && children}
        </>
    )
}

export const withCanduPaywall = (props: Omit<Props, 'children'>) => {
    return (FallbackPaywall: ComponentType) => {
        return (ownProps: ComponentProps<typeof FallbackPaywall>) => {
            return (
                <CanduPaywall {...props}>
                    <FallbackPaywall {...ownProps} />
                </CanduPaywall>
            )
        }
    }
}

export default CanduPaywall
