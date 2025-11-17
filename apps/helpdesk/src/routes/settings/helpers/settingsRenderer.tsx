import type { ComponentProps, ComponentType } from 'react'
import React from 'react'

import App from 'pages/App'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import SettingsNavbar from 'pages/settings/common/SettingsNavbar/SettingsNavbar'

type NarrowedWithUserRoleParams =
    Parameters<typeof withUserRoleRequired> extends [
        infer __Enforced,
        ...infer NarrowedWithUserRoleParams,
    ]
        ? NarrowedWithUserRoleParams
        : never

type SettingsType<C extends ComponentType<any>> = {
    componentProps?: ComponentProps<C> extends Record<string, unknown>
        ? ComponentProps<C>
        : never
    appProps?: ComponentProps<typeof App>
    roleParams?: NarrowedWithUserRoleParams
    paywallParams?: Parameters<typeof withFeaturePaywall>
}

// `any` here is the only way to make sure the `componentProps` is considered
// as `undefined` when component has no props.
// @ts-ignore-next-line no-explicit-any
export function renderApp<C extends ComponentType<any>>(
    Component: C,
    settings: SettingsType<C> = {},
) {
    const roleSettings =
        settings.roleParams || ([] as NarrowedWithUserRoleParams)
    const UserRestrictedComponent = withUserRoleRequired(
        Component,
        ...roleSettings,
    )

    if (settings.paywallParams) {
        const PaywallRestrictedComponent = withFeaturePaywall(
            ...settings.paywallParams,
        )(UserRestrictedComponent)

        return (
            <App {...settings.appProps}>
                <PaywallRestrictedComponent
                    {...(settings.componentProps || {})}
                />
            </App>
        )
    }

    return (
        <App {...settings.appProps}>
            <UserRestrictedComponent {...(settings.componentProps || {})} />
        </App>
    )
}

export function renderAppSettings<C extends ComponentType<any>>(
    Component: C,
    settings: SettingsType<C> = {},
) {
    return renderApp(Component, {
        ...settings,
        appProps: {
            navbar: SettingsNavbar,
            ...settings.appProps,
        },
    })
}
