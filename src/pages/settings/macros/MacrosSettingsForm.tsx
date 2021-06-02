import classnames from 'classnames'
import {fromJS, Map, List} from 'immutable'
import _uniqWith from 'lodash/uniqWith'
import React, {useEffect, useState, SyntheticEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, withRouter, RouteComponentProps} from 'react-router-dom'
import {useAsyncFn} from 'react-use'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Container,
    Form,
    FormGroup,
} from 'reactstrap'

import {DEFAULT_ACTIONS} from '../../../config'
import {GorgiasError} from '../../../models/api/types'
import {
    createMacro,
    deleteMacro,
    fetchMacro,
    updateMacro,
} from '../../../models/macro/resources'
import {MacroDraft} from '../../../models/macro/types'
import {getAgents} from '../../../state/agents/selectors'
import {
    macroCreated,
    macroDeleted,
    macroFetched,
    macroUpdated,
} from '../../../state/entities/macros/actions'
import {getDefaultMacro, getErrorReason} from '../../../state/macro/utils'
import {notify} from '../../../state/notifications/actions'
import {NotificationStatus} from '../../../state/notifications/types'
import {RootState} from '../../../state/types'
import ConfirmButton from '../../common/components/ConfirmButton'
import Loader from '../../common/components/Loader/Loader'
import PageHeader from '../../common/components/PageHeader'
import MacroEdit from '../../tickets/common/macros/components/MacroEdit'
import history from '../../history'
import {errorToChildren} from '../../../utils'

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
    const [
        {loading: isFetchPending},
        handleMacroFetch,
    ] = useAsyncFn(async () => {
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
    const [
        {loading: isSubmitPending},
        handleFormSubmit,
    ] = useAsyncFn(async () => {
        let res
        try {
            if (macroId) {
                res = await updateMacro({
                    ...macros[macroId],
                    ...macroForm,
                })
                macroUpdated(res)
            } else {
                res = await createMacro(macroForm)
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
            const gorgiasError = error as GorgiasError
            const message = gorgiasError.response.data.error.msg
            const reason = getErrorReason(gorgiasError)
            void notify({
                message: `${message} ${reason}`,
                status: NotificationStatus.Error,
            })
        }
    }, [macroId, macroForm])
    const [
        {loading: isDuplicatePending},
        handleMacroDuplicate,
    ] = useAsyncFn(async () => {
        if (!macroId) {
            return
        }
        const {actions, name} = macros[macroId]
        try {
            const res = await createMacro({
                actions,
                name: `${name} (copy)`,
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
                title: (error as GorgiasError).response.data.error.msg,
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
            const {actions, name} = macros[macroId]
            setMacroForm({
                actions,
                name,
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
                className={classnames('page-container', css.container)}
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
                            setActions={(actions) =>
                                !isActionDisabled &&
                                handleActionsChange(actions)
                            }
                            setName={(name: string) =>
                                !isActionDisabled &&
                                setMacroForm({...macroForm, name})
                            }
                        />
                        <FormGroup className="mt-5">
                            <Button
                                className={classnames(
                                    {
                                        'btn-loading': isSubmitPending,
                                    },
                                    'mr-2'
                                )}
                                color="success"
                                disabled={isActionDisabled}
                                type="submit"
                            >
                                {macroId ? 'Update macro' : 'Create macro'}
                            </Button>
                            {macroId && (
                                <Button
                                    className={classnames({
                                        'btn-loading': isDuplicatePending,
                                    })}
                                    color="secondary"
                                    onClick={handleMacroDuplicate}
                                    disabled={isActionDisabled}
                                    type="button"
                                >
                                    Duplicate macro
                                </Button>
                            )}
                            {macroId && (
                                <ConfirmButton
                                    className="float-right"
                                    color="secondary"
                                    content="You are about to delete this macro."
                                    confirm={handleDelete}
                                    confirmColor="danger"
                                    loading={isDeletePending}
                                    type="button"
                                >
                                    <i
                                        className={classnames(
                                            'material-icons mr-2',
                                            css.deleteIcon
                                        )}
                                    >
                                        delete
                                    </i>
                                    Delete macro
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
