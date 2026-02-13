import type { MouseEvent, SyntheticEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { history } from '@repo/routing'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _uniqWith from 'lodash/uniqWith'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, Form } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'
import type {
    CreateMacroBody,
    Language,
    UpdateMacroBody,
} from '@gorgias/helpdesk-queries'
import { useGetMacro } from '@gorgias/helpdesk-queries'

import { useAppNode } from 'appNode'
import { DEFAULT_ACTIONS } from 'config'
import {
    useBulkArchiveMacros,
    useBulkUnarchiveMacros,
    useCreateMacro,
    useDeleteMacro,
    useUpdateMacro,
} from 'hooks/macros'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { isGorgiasApiError } from 'models/api/types'
import type { MacroDraft } from 'models/macro/types'
import { MacroActionName } from 'models/macroAction/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import settingsCss from 'pages/settings/settings.less'
import { MacroEdit } from 'pages/tickets/common/macros/components/MacroEdit'
import { getHumanAgents } from 'state/agents/selectors'
import { getDefaultMacro } from 'state/macro/utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

import css from './MacrosSettingsForm.less'

const MacrosSettingsForm = () => {
    const appNode = useAppNode()
    const hasAgentPrivileges = useHasAgentPrivileges()
    const { macroId } = useParams<{ macroId?: string }>()
    const location = useLocation()
    const agents = useAppSelector(getHumanAgents)
    const dispatch = useAppDispatch()
    const [macroForm, setMacroForm] = useState<MacroDraft>(getDefaultMacro())
    const isMacroLoaded = useRef(false)

    const buildRedirectUrl = useCallback(
        (basePath: string) => {
            let searchParams: URLSearchParams

            const stateSearch = (location.state as any)?.search
            if (stateSearch) {
                searchParams = new URLSearchParams(stateSearch)
            } else if (location.search) {
                searchParams = new URLSearchParams(location.search)
            } else {
                try {
                    const referrer = document.referrer
                    if (referrer && referrer.includes(basePath)) {
                        const url = new URL(referrer)
                        searchParams = new URLSearchParams(url.search)
                    } else {
                        searchParams = new URLSearchParams()
                    }
                } catch {
                    searchParams = new URLSearchParams()
                }
            }

            searchParams.delete('cursor')
            const queryString = searchParams.toString()
            return queryString ? `${basePath}?${queryString}` : basePath
        },
        [location.search, location.state],
    )

    const { data, isInitialLoading } = useGetMacro(parseInt(macroId!), {
        query: {
            enabled: !!macroId,
            onError: (error) => {
                void dispatch(
                    notify({
                        title: isGorgiasApiError(error)
                            ? error.response?.data.error.msg
                            : 'Failed to fetch macro',
                        status: NotificationStatus.Error,
                    }),
                )
                history.push('/app/settings/macros')
            },
        },
    })
    const macro = useMemo(() => data?.data, [data])

    useEffect(() => {
        if (macroId && macro) {
            const { actions, name, language } = macro

            setMacroForm({
                actions,
                name,
                language,
            })
            isMacroLoaded.current = true
        }
    }, [macro, macroId])

    const { mutateAsync: createMacro } = useCreateMacro()
    const { mutateAsync: duplicateMacro } = useCreateMacro({
        onError: (error) => {
            void dispatch(
                notify({
                    title: 'Failed to duplicate macro',
                    message: errorToChildren(error)!,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                }),
            )
        },
        onSuccess: (res) => {
            void dispatch(
                notify({
                    message: 'Successfully duplicated macro',
                    status: NotificationStatus.Success,
                }),
            )
            history.push(`/app/settings/macros/${res.data.id}`)
        },
    })
    const { mutateAsync: updateMacro } = useUpdateMacro()
    const { mutateAsync: deleteMacro } = useDeleteMacro()

    const isArchived = !!macro ? !!macro.archived_datetime : undefined

    const { mutate: bulkArchiveMacros, isLoading: isArchivingPending } =
        useBulkArchiveMacros()
    const { mutate: bulkUnarchiveMacros, isLoading: isUnarchivingPending } =
        useBulkUnarchiveMacros()

    const handleActionsChange = useCallback(
        (actions?: List<any> | null) => {
            const filteredActions = actions?.filter((action: Map<any, any>) =>
                DEFAULT_ACTIONS.includes(action.get('name')),
            )

            setMacroForm({
                ...macroForm,
                actions: _uniqWith(
                    filteredActions ? filteredActions.toJS() : {},
                    (first, second) => {
                        if (
                            first.name === MacroActionName.Http ||
                            first.name === MacroActionName.SetCustomFieldValue
                        ) {
                            return false
                        }

                        return first.name === second.name
                    },
                ),
            })
        },
        [macroForm],
    )

    const [{ loading: isSubmitPending }, handleFormSubmit] =
        useAsyncFn(async () => {
            const { actions, language } = macroForm

            const macroFormData = {
                ...macroForm,
                actions:
                    actions?.filter(
                        (action) =>
                            (action.name !== MacroActionName.AddTags ||
                                action.arguments.tags) &&
                            (action.arguments.custom_field_id === undefined ||
                                (action.arguments.custom_field_id !==
                                    undefined &&
                                    action.arguments.value !== '')),
                    ) ?? null,
                language: language || null,
            }

            if (macroId) {
                await updateMacro(
                    {
                        id: parseInt(macroId),
                        data: {
                            ...macro,
                            ...(macroFormData as UpdateMacroBody),
                        },
                    },
                    {
                        onSuccess: () => {
                            void dispatch(
                                notify({
                                    message: 'Successfully updated macro',
                                    status: NotificationStatus.Success,
                                }),
                            )
                            const basePath = macro?.archived_datetime
                                ? '/app/settings/macros/archived'
                                : '/app/settings/macros/active'
                            history.push(buildRedirectUrl(basePath))
                        },
                    },
                )
            } else {
                await createMacro(
                    {
                        data: macroFormData as CreateMacroBody,
                    },
                    {
                        onSuccess: () => {
                            void dispatch(
                                notify({
                                    message: 'Successfully created macro',
                                    status: NotificationStatus.Success,
                                }),
                            )
                            history.goBack()
                        },
                    },
                )
            }
        }, [macroId, macroForm])

    const [{ loading: isDuplicatePending }, handleMacroDuplicate] =
        useAsyncFn(async () => {
            if (!macro) {
                return
            }
            const { actions, name, language } = macro

            await duplicateMacro({
                data: {
                    actions,
                    name: `(Copy) ${name}`,
                    language,
                },
            })
        }, [macro])

    const handleMacroArchiveOrUnarchive = (
        e: MouseEvent<HTMLButtonElement>,
    ) => {
        e.preventDefault()
        e.stopPropagation()
        if (!!macroId) {
            if (isArchived) {
                bulkUnarchiveMacros({
                    data: { ids: [parseInt(macroId)] },
                })
                history.push(buildRedirectUrl('/app/settings/macros/archived'))
            } else {
                bulkArchiveMacros({ data: { ids: [parseInt(macroId)] } })
                history.push(buildRedirectUrl('/app/settings/macros/active'))
            }
        }
    }

    const [{ loading: isDeletePending }, handleDelete] = useAsyncFn(
        async () => {
            if (!macroId) {
                return
            }
            await deleteMacro(
                { id: parseInt(macroId) },
                {
                    onSuccess: () => {
                        void dispatch(
                            notify({
                                message: 'Successfully deleted macro',
                                status: NotificationStatus.Success,
                            }),
                        )
                        history.goBack()
                    },
                },
            )
        },
    )

    const hasInputError = !macroForm.name

    const isActionDisabled =
        isSubmitPending ||
        isDeletePending ||
        isDuplicatePending ||
        isArchivingPending ||
        isUnarchivingPending

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/macros">Macros</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {!macroId
                                ? 'Add macro'
                                : !data?.data.id
                                  ? 'Edit'
                                  : `Edit: ${data.data.name}`}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <div
                className={classnames(css.container, settingsCss.pageContainer)}
            >
                {isInitialLoading || (!isMacroLoaded.current && !!macroId) ? (
                    <Loader />
                ) : (
                    <Form
                        onSubmit={(e: SyntheticEvent<HTMLFormElement>) => {
                            e.preventDefault()
                            if (!isActionDisabled && !hasInputError) {
                                void handleFormSubmit()
                            }
                        }}
                    >
                        <MacroEdit
                            actions={fromJS(macroForm.actions)}
                            agents={agents}
                            currentMacro={macroForm}
                            name={macroForm.name ?? ''}
                            language={macroForm.language ?? ''}
                            setActions={(actions) =>
                                !isActionDisabled &&
                                handleActionsChange(actions)
                            }
                            setName={(name: string) =>
                                !isActionDisabled &&
                                setMacroForm({ ...macroForm, name })
                            }
                            setLanguage={(language: string | null) =>
                                !isActionDisabled &&
                                setMacroForm({
                                    ...macroForm,
                                    language: language as Language,
                                })
                            }
                            container={appNode ?? undefined}
                        />
                        <div className={css.footer}>
                            <div className={css.sub}>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitPending}
                                    isDisabled={
                                        !hasAgentPrivileges ||
                                        isActionDisabled ||
                                        hasInputError
                                    }
                                >
                                    {macroId ? 'Update macro' : 'Create macro'}
                                </Button>
                                {macroId && (
                                    <Button
                                        intent="secondary"
                                        isLoading={isDuplicatePending}
                                        isDisabled={
                                            !hasAgentPrivileges ||
                                            isActionDisabled
                                        }
                                        onClick={handleMacroDuplicate}
                                    >
                                        Duplicate macro
                                    </Button>
                                )}
                            </div>
                            <div className={css.sub}>
                                {!!macroId && (
                                    <Button
                                        type="submit"
                                        intent="secondary"
                                        isLoading={
                                            isArchivingPending ||
                                            isUnarchivingPending
                                        }
                                        onClick={handleMacroArchiveOrUnarchive}
                                        isDisabled={
                                            !hasAgentPrivileges ||
                                            isActionDisabled ||
                                            hasInputError
                                        }
                                    >
                                        {isArchived ? 'Unarchive ' : 'Archive '}
                                        macro
                                    </Button>
                                )}
                                {macroId && (
                                    <ConfirmButton
                                        intent="destructive"
                                        confirmationContent="You are about to delete this macro."
                                        onConfirm={handleDelete}
                                        isLoading={isDeletePending}
                                        isDisabled={!hasAgentPrivileges}
                                        leadingIcon="delete"
                                    >
                                        Delete macro
                                    </ConfirmButton>
                                )}
                            </div>
                        </div>
                    </Form>
                )}
            </div>
        </div>
    )
}

export default MacrosSettingsForm
