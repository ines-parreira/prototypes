import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import _uniqWith from 'lodash/uniqWith'
import React, {SyntheticEvent, useEffect, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {useAsyncFn} from 'react-use'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Form,
    FormGroup,
} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import {DEFAULT_ACTIONS} from 'config'
import {
    createMacro,
    deleteMacro,
    fetchMacro,
    updateMacro,
} from 'models/macro/resources'
import {MacroDraft} from 'models/macro/types'
import {getAgents} from 'state/agents/selectors'
import {
    macroCreated,
    macroDeleted,
    macroFetched,
    macroUpdated,
} from 'state/entities/macros/actions'
import {getDefaultMacro, getErrorReason} from 'state/macro/utils'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState} from 'state/types'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import MacroEdit from 'pages/tickets/common/macros/components/MacroEdit'
import history from 'pages/history'
import {errorToChildren} from 'utils'
import settingsCss from 'pages/settings/settings.less'
import {MacroApiError} from 'state/macro/types'

import {MacroActionName} from 'models/macroAction/types'
import css from './MacrosSettingsForm.less'

type OwnProps = RouteComponentProps<{macroId?: string}>

export function MacrosSettingsFormContainer({
    agents,
    macroCreated,
    macroDeleted,
    macroFetched,
    macroUpdated,
    macros,
    notify,
    match: {
        params: {macroId},
    },
}: OwnProps & ConnectedProps<typeof connector>) {
    const [macroForm, setMacroForm] = useState<MacroDraft>(
        getDefaultMacro().toJS()
    )
    const [{loading: isFetchPending}, handleMacroFetch] =
        useAsyncFn(async () => {
            if (!macroId) {
                return
            }
            try {
                const res = await fetchMacro(parseInt(macroId))
                macroFetched(res)
            } catch (error) {
                void notify({
                    message: 'Failed to fetch macro',
                    status: NotificationStatus.Error,
                })
                history.push('/app/settings/macros')
            }
        }, [macroId])
    const handleActionsChange = (actions: List<any>) => {
        const filteredActions = actions.filter((action: Map<any, any>) =>
            DEFAULT_ACTIONS.includes(action.get('name'))
        )

        setMacroForm({
            ...macroForm,
            actions: _uniqWith(filteredActions.toJS(), (first, second) => {
                if (first.name === 'http') {
                    return false
                }

                return first.name === second.name
            }),
        })
    }
    const [{loading: isSubmitPending}, handleFormSubmit] =
        useAsyncFn(async () => {
            macroForm.actions = macroForm.actions.filter(
                (action) =>
                    action.name !== MacroActionName.AddTags ||
                    action.arguments.tags
            )

            let res
            try {
                if (macroId) {
                    res = await updateMacro({
                        ...macros[macroId],
                        ...macroForm,
                        language: macroForm.language || null,
                    })
                    macroUpdated(res)
                } else {
                    res = await createMacro({
                        ...macroForm,
                        language: macroForm.language || null,
                    })
                    macroCreated(res)
                }
                void notify({
                    message: `Successfully ${
                        macroId ? 'updated' : 'created'
                    } macro.`,
                    status: NotificationStatus.Success,
                })
                history.push('/app/settings/macros')
            } catch (error) {
                const gorgiasError = error as MacroApiError
                const message = gorgiasError.response.data.error.msg
                const reason = getErrorReason(gorgiasError)
                void notify({
                    message: `${message} ${reason}`,
                    status: NotificationStatus.Error,
                })
            }
        }, [macroId, macroForm])
    const [{loading: isDuplicatePending}, handleMacroDuplicate] =
        useAsyncFn(async () => {
            if (!macroId) {
                return
            }
            const {actions, name, language} = macros[macroId]
            try {
                const res = await createMacro({
                    actions,
                    name: `${name} (copy)`,
                    language,
                })
                macroCreated(res)
                void notify({
                    message: `Successfully duplicated macro.`,
                    status: NotificationStatus.Success,
                })
                history.push(`/app/settings/macros/${res.id}`)
            } catch (error) {
                void notify({
                    message: 'Failed to duplicate macro.',
                    status: NotificationStatus.Error,
                })
            }
        }, [macros, macroId])

    const [{loading: isDeletePending}, handleDelete] = useAsyncFn(async () => {
        if (!macroId) {
            return
        }
        try {
            const macroIdNumber = parseInt(macroId)
            await deleteMacro(macroIdNumber)
            macroDeleted(macroIdNumber)
            void notify({
                message: 'Successfully deleted macro',
                status: NotificationStatus.Success,
            })
            history.push('/app/settings/macros')
        } catch (error) {
            void notify({
                title: (error as MacroApiError).response.data.error.msg,
                message: errorToChildren(error)!,
                allowHTML: true,
                status: NotificationStatus.Error,
            })
        }
    })
    useEffect(() => {
        if (macroId) {
            void handleMacroFetch()
        }
    }, [macroId])
    useEffect(() => {
        if (macroId && macros[macroId]) {
            const {actions, name, language} = macros[macroId]
            setMacroForm({
                actions,
                name,
                language,
            })
        }
    }, [macros, macroId])
    const isActionDisabled =
        isSubmitPending || isDeletePending || isDuplicatePending

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
                                : !macros[macroId]
                                ? 'Edit'
                                : `Edit: ${macros[macroId].name}`}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container
                fluid
                className={classnames(css.container, settingsCss.pageContainer)}
            >
                {isFetchPending ? (
                    <Loader />
                ) : (
                    <Form
                        onSubmit={(e: SyntheticEvent<HTMLFormElement>) => {
                            e.preventDefault()
                            if (!isActionDisabled) {
                                void handleFormSubmit()
                            }
                        }}
                    >
                        <MacroEdit
                            actions={fromJS(macroForm.actions)}
                            agents={agents}
                            currentMacro={fromJS(macroForm)}
                            name={macroForm.name}
                            language={macroForm.language}
                            setActions={(actions) =>
                                !isActionDisabled &&
                                handleActionsChange(actions)
                            }
                            setName={(name: string) =>
                                !isActionDisabled &&
                                setMacroForm({...macroForm, name})
                            }
                            setLanguage={(language: string | null) =>
                                !isActionDisabled &&
                                setMacroForm({...macroForm, language})
                            }
                        />
                        <FormGroup className="mt-5">
                            <Button
                                type="submit"
                                className="mr-2"
                                isLoading={isSubmitPending}
                                isDisabled={isActionDisabled}
                            >
                                {macroId ? 'Update macro' : 'Create macro'}
                            </Button>
                            {macroId && (
                                <Button
                                    intent="secondary"
                                    isLoading={isDuplicatePending}
                                    isDisabled={isActionDisabled}
                                    onClick={handleMacroDuplicate}
                                >
                                    Duplicate macro
                                </Button>
                            )}
                            {macroId && (
                                <ConfirmButton
                                    className="float-right"
                                    intent="destructive"
                                    confirmationContent="You are about to delete this macro."
                                    onConfirm={handleDelete}
                                    isLoading={isDeletePending}
                                >
                                    <ButtonIconLabel icon="delete">
                                        Delete macro
                                    </ButtonIconLabel>
                                </ConfirmButton>
                            )}
                        </FormGroup>
                    </Form>
                )}
            </Container>
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        agents: getAgents(state),
        macros: state.entities.macros,
    }),
    {
        macroCreated,
        macroDeleted,
        macroFetched,
        macroUpdated,
        notify,
    }
)

export default withRouter(connector(MacrosSettingsFormContainer))
