import { useCallback, useEffect, useMemo } from 'react'

import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import type { FieldPath, PathValue } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import {
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
} from 'config/integrations/gorgias_chat'
import useAppDispatch from 'hooks/useAppDispatch'
import type {
    GorgiasChatAvatarSettings,
    GorgiasChatIntegrationMeta,
    GorgiasChatPosition,
} from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatLauncherType,
} from 'models/integration/types'
import { usePrivacyPolicyText } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/hooks/usePrivacyPolicyText'
import { updateOrCreateIntegration } from 'state/integrations/actions'

export type GorgiasChatLauncherSettings = {
    type: GorgiasChatLauncherType
    label: string
}

export type AppearanceFormValues = {
    name: string
    mainColor: string
    conversationColor: string
    useMainColorOutsideBusinessHours: boolean
    headerPictureUrl?: string
    headerAlternativePictureUrl?: string
    introductionText: string
    offlineIntroductionText: string
    position: GorgiasChatPosition
    launcher: GorgiasChatLauncherSettings
    avatar: GorgiasChatAvatarSettings
    legalDisclaimerEnabled: boolean
}

const buildFormValues = (integration: Map<any, any>): AppearanceFormValues => {
    const mainColor = integration.getIn(
        ['decoration', 'main_color'],
        GORGIAS_CHAT_DEFAULT_COLOR,
    )

    return {
        name: integration.get('name', ''),
        mainColor,
        conversationColor: integration.getIn(
            ['decoration', 'conversation_color'],
            mainColor,
        ),
        useMainColorOutsideBusinessHours: integration.getIn(
            ['decoration', 'use_main_color_outside_business_hours'],
            false,
        ),
        headerPictureUrl: integration.getIn([
            'decoration',
            'header_picture_url',
        ]),
        headerAlternativePictureUrl: integration.getIn([
            'decoration',
            'header_alternative_picture_url',
        ]),
        introductionText: integration.getIn(
            ['decoration', 'introduction_text'],
            '',
        ),
        offlineIntroductionText: integration.getIn(
            ['decoration', 'offline_introduction_text'],
            '',
        ),
        position: {
            alignment: integration.getIn(
                ['decoration', 'position', 'alignment'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.alignment,
            ),
            offsetX: integration.getIn(
                ['decoration', 'position', 'offsetX'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetX,
            ),
            offsetY: integration.getIn(
                ['decoration', 'position', 'offsetY'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetY,
            ),
        },
        launcher: {
            type: integration.getIn(
                ['decoration', 'launcher', 'type'],
                GorgiasChatLauncherType.ICON,
            ),
            label: integration.getIn(['decoration', 'launcher', 'label'], ''),
        },
        avatar: {
            imageType: integration.getIn(
                ['decoration', 'avatar', 'image_type'],
                GorgiasChatAvatarImageType.AGENT_PICTURE,
            ),
            nameType: integration.getIn(
                ['decoration', 'avatar', 'name_type'],
                GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
            ),
            companyLogoUrl: integration.getIn([
                'decoration',
                'avatar',
                'company_logo_url',
            ]),
        },
        legalDisclaimerEnabled: integration.getIn(
            ['meta', 'preferences', 'privacy_policy_disclaimer_enabled'],
            false,
        ),
    }
}

type UseAppearanceFormParams = {
    integration: Map<any, any>
    loading: Map<any, any>
}

export const useAppearanceForm = ({
    integration,
    loading,
}: UseAppearanceFormParams) => {
    const dispatch = useAppDispatch()

    const {
        handleSubmit,
        watch,
        setValue: setValueRaw,
        reset,
        formState: { isDirty: isFormDirty },
    } = useForm<AppearanceFormValues>({
        defaultValues: buildFormValues(integration),
    })

    const integrationId: number | undefined = integration.get('id')
    const isSubmitting =
        integrationId !== undefined &&
        loading.get('updateIntegration') === integrationId

    useEffect(() => {
        if (loading.get('integration')) {
            return
        }
        reset(buildFormValues(integration))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [integration])

    const chatApplicationId: string | undefined = integration.getIn([
        'meta',
        'app_id',
    ])

    const integrationMeta = useMemo<GorgiasChatIntegrationMeta | undefined>(
        () => integration.get('meta')?.toJS(),
        [integration],
    )

    const {
        privacyPolicyText,
        setPrivacyPolicyText,
        savePrivacyPolicyText,
        isPrivacyPolicyTextDirty,
    } = usePrivacyPolicyText({ chatApplicationId, integrationMeta })

    // RHF v7 setValue defaults shouldDirty to false — always opt in to dirty tracking
    const setValue = useCallback(
        <K extends FieldPath<AppearanceFormValues>>(
            name: K,
            value: PathValue<AppearanceFormValues, K>,
        ) => setValueRaw(name, value, { shouldDirty: true }),
        [setValueRaw],
    )

    const isDirty = isFormDirty || isPrivacyPolicyTextDirty

    const onSubmit = async (data: AppearanceFormValues) => {
        const mainColor = CSS.supports('color', data.mainColor)
            ? data.mainColor.trim()
            : GORGIAS_CHAT_DEFAULT_COLOR
        const conversationColor = CSS.supports('color', data.conversationColor)
            ? data.conversationColor.trim()
            : GORGIAS_CHAT_DEFAULT_COLOR

        const originalDecoration = integration.get('decoration')?.toJS() ?? {}
        const originalMeta = integration.get('meta')?.toJS() ?? {}

        const form = {
            id: integrationId,
            type: integration.get('type'),
            name: data.name,
            decoration: {
                ...originalDecoration,
                main_color: mainColor,
                conversation_color: conversationColor,
                use_main_color_outside_business_hours:
                    data.useMainColorOutsideBusinessHours,
                header_picture_url: data.headerPictureUrl,
                header_alternative_picture_url:
                    data.headerAlternativePictureUrl,
                introduction_text: data.introductionText,
                offline_introduction_text: data.offlineIntroductionText,
                position: data.position,
                launcher: {
                    type: data.launcher.type,
                    ...(data.launcher.type ===
                        GorgiasChatLauncherType.ICON_AND_LABEL && {
                        label: data.launcher.label,
                    }),
                },
                avatar: {
                    image_type: data.avatar.imageType,
                    name_type: data.avatar.nameType,
                    ...(data.avatar.companyLogoUrl && {
                        company_logo_url: data.avatar.companyLogoUrl,
                    }),
                },
            },
            meta: {
                ...originalMeta,
                preferences: {
                    ...originalMeta.preferences,
                    privacy_policy_disclaimer_enabled:
                        data.legalDisclaimerEnabled,
                },
            },
        }

        await dispatch(updateOrCreateIntegration(fromJS(form)))
        savePrivacyPolicyText(privacyPolicyText)
    }

    return {
        handleSubmit,
        setValue,
        values: watch(),
        isSubmitting,
        isDirty,
        privacyPolicyText,
        setPrivacyPolicyText,
        onSubmit,
    }
}
