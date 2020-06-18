//@flow
import classnames from 'classnames'
import {fromJS, type Map} from 'immutable'
import _uniqWith from 'lodash/uniqWith'
//$FlowFixMe
import React, {useEffect, useState, type SyntheticEvent} from 'react'
import {connect} from 'react-redux'
import {browserHistory, Link} from 'react-router'
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
import type {IntentName} from '../../../models/intent'
import {createMacro, deleteMacro, fetchMacro, updateMacro, type MacroDraft} from '../../../models/macro'
import {getAgents} from '../../../state/agents/selectors'
import {macroCreated, macroDeleted, macroFetched, macroUpdated, type MacrosState} from '../../../state/entities/macros'
import {getDefaultMacro} from '../../../state/macro/utils'
import {notify} from '../../../state/notifications/actions'
import ConfirmButton from '../../common/components/ConfirmButton'
import Loader from '../../common/components/Loader'
import PageHeader from '../../common/components/PageHeader'
import MacroEdit from '../../tickets/common/macros/components/MacroEdit'

import css from './MacrosSettingsForm.less'

type OwnProps = {
    params: {
        macroId?: string,
    },
}

type Props = OwnProps & {
    agents: Map<*, *>,
    macroCreated: typeof macroCreated,
    macroDeleted: typeof macroDeleted,
    macroFetched: typeof macroFetched,
    macroUpdated: typeof macroUpdated,
    macros: MacrosState,
    notify: typeof notify,
}

export function MacrosSettingsFormContainer({
    agents,
    macroCreated,
    macroDeleted,
    macroFetched,
    macroUpdated,
    macros,
    notify,
    params: {macroId},
}: Props) {
    const [macroForm, setMacroForm] = useState<MacroDraft>(getDefaultMacro().toJS())
    const [{loading: isFetchPending}, handleMacroFetch] = useAsyncFn(async () => {
        try {
            const res = await fetchMacro(parseInt(macroId))
            macroFetched(res)
        } catch (error) {
            notify({
                message: 'Failed to fetch macro',
                status: 'error',
            })
            browserHistory.push('/app/settings/macros')
        }
    }, [macroId])
    const handleActionsChange = (actions: Map<*, *>) => {
        const filteredActions = actions.filter((action) => DEFAULT_ACTIONS.includes(action.get('name')))

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
    const [{loading: isSubmitPending}, handleFormSubmit] = useAsyncFn(async () => {
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
            notify({
                message: `Successfully ${macroId ? 'updated' : 'created'} macro.`,
                status: 'success',
            })
            browserHistory.push('/app/settings/macros')
        } catch (error) {
            notify({
                message: `Failed to ${macroId ? 'update' : 'create'} macro.`,
                status: 'error',
            })
        }
    }, [macroId, macroForm])
    const [{loading: isDeletePending}, handleDelete] = useAsyncFn(async () => {
        try {
            const macroIdNumber = parseInt(macroId)
            await deleteMacro(macroIdNumber)
            macroDeleted(macroIdNumber)
            notify({
                message: 'Successfully deleted macro',
                status: 'success',
            })
            browserHistory.push('/app/settings/macros')
        } catch (error) {
            notify({
                message: 'Failed to delete macro',
                status: 'error',
            })
        }
    })
    useEffect(() => {
        if (macroId) {
            handleMacroFetch()
        }
    }, [macroId])
    useEffect(() => {
        if (macroId && macros[macroId]) {
            const {actions, intent, name} = macros[macroId]
            setMacroForm({
                actions,
                intent,
                name,
            })
        }
    }, [macros, macroId])
    const isActionDisabled = isSubmitPending || isDeletePending

    return (
        <div className="full-width">
            <PageHeader title={(
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/settings/macros">
                            Macros
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {!macroId ?
                            'Add macro'
                            : !macros[macroId] ?
                                'Edit'
                                :
                                `Edit: ${macros[macroId].name}`
                        }
                    </BreadcrumbItem>
                </Breadcrumb>
            )}/>
            <Container
                fluid
                className={classnames('page-container', css.container)}
            >
                {isFetchPending ?
                    <Loader/>
                    :
                    <Form
                        onSubmit={(e: SyntheticEvent<HTMLFormElement>) => {
                            e.preventDefault()
                            if (!isActionDisabled) {
                                handleFormSubmit()
                            }
                        }}
                    >
                        <MacroEdit
                            actions={fromJS(macroForm.actions)}
                            agents={agents}
                            currentMacro={fromJS(macroForm)}
                            intent={macroForm.intent}
                            name={macroForm.name}
                            setActions={(actions) => !isActionDisabled && handleActionsChange(actions)}
                            setName={(name: string) => !isActionDisabled && setMacroForm({...macroForm, name})}
                            setIntent={(intent: ?IntentName) => !isActionDisabled && setMacroForm({...macroForm, intent})}
                        />
                        <FormGroup className="mt-5">
                            <Button
                                className={classnames({
                                    'btn-loading': isSubmitPending,
                                })}
                                color="success"
                                disabled={isActionDisabled}
                                type="submit"
                            >
                                {macroId ? 'Update macro' : 'Create macro'}
                            </Button>
                            {macroId &&
                                <ConfirmButton
                                    className="float-right"
                                    color="secondary"
                                    content="You are about to delete this macro."
                                    confirm={handleDelete}
                                    confirmColor="danger"
                                    loading={isDeletePending}
                                    type="button"
                                >
                                    <i className={classnames('material-icons mr-2', css.deleteIcon)}>
                                        delete
                                    </i>
                                    Delete macro
                                </ConfirmButton>
                            }
                        </FormGroup>
                    </Form>
                }
            </Container>
        </div>
    )
}

const mapStateToProps = (state) => ({
    agents: getAgents(state),
    macros: state.entities.macros,
})

const mapDispatchToProps = {
    macroCreated,
    macroDeleted,
    macroFetched,
    macroUpdated,
    notify,
}

export default connect(mapStateToProps, mapDispatchToProps)(MacrosSettingsFormContainer)
