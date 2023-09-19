import React, {Fragment} from 'react'
import {useQueryClient} from '@tanstack/react-query'
import InputField from 'pages/common/forms/input/InputField'
import Button from 'pages/common/components/button/Button'
import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import Loader from '../../../../common/components/Loader/Loader'
import {isProduction, isStaging} from '../../../../../utils/environment'
import {
    helpCenterRedirectsKey,
    useCreateHelpCenterRedirect,
    useDeleteHelpCenterRedirect,
    useGetHelpCenterRedirectList,
} from './queries'

export const ManageRedirects = () => {
    const [newRedirect, setNewRedirect] = React.useState({
        from: '',
        to: '',
    })

    const queryClient = useQueryClient()

    const helpCenter = useCurrentHelpCenter()

    const getRedirectList = useGetHelpCenterRedirectList(helpCenter.id, {
        retry: false,
    })

    const {mutate: deleteRedirect} = useDeleteHelpCenterRedirect()
    const {mutate: createRedirect} = useCreateHelpCenterRedirect()

    const handleCreateRedirect = () => {
        // on success, clear the form
        createRedirect(
            [undefined, {help_center_id: helpCenter.id}, newRedirect],
            {
                onError: (error) => {
                    alert(error)
                },
                onSuccess: () => {
                    setNewRedirect({from: '', to: ''})
                    void queryClient.invalidateQueries({
                        queryKey: helpCenterRedirectsKey.lists(helpCenter.id),
                    })
                },
            }
        )
    }

    const handleDeleteRedirect = (from: string) => {
        deleteRedirect([undefined, {help_center_id: helpCenter.id}, {from}], {
            onError: (error) => {
                alert(error)
            },
            onSuccess: () => {
                void queryClient.invalidateQueries({
                    queryKey: helpCenterRedirectsKey.lists(helpCenter.id),
                })
            },
        })
    }

    if (!getRedirectList.isFetched) {
        return (
            <section>
                <h3>Manage redirections</h3>
                <Loader />
            </section>
        )
    }

    if (!getRedirectList.data) {
        return (
            <section>
                <h3>Manage redirections</h3>
                No data found
            </section>
        )
    }
    return (
        <section style={{width: '100%'}}>
            <h3>Manage redirections</h3>

            <h4>Add new redirect</h4>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end',
                }}
            >
                <InputField
                    type="text"
                    label="From"
                    value={newRedirect.from}
                    placeholder="/old-article-url"
                    onChange={(nextValue) => {
                        setNewRedirect((prev) => ({
                            ...prev,
                            from: nextValue,
                        }))
                    }}
                />
                <InputField
                    type="text"
                    label="To"
                    placeholder="/en-US/xxx-12345"
                    value={newRedirect.to}
                    onChange={(nextValue) => {
                        setNewRedirect((prev) => ({
                            ...prev,
                            to: nextValue,
                        }))
                    }}
                />
                <Button intent="primary" onClick={handleCreateRedirect}>
                    Add Redirect
                </Button>
            </div>
            <br />
            <h4>Existing redirects</h4>
            <ul>
                {getRedirectList.data.map((redirect) => {
                    const buildRedirectUrl = (from: string) => {
                        if (isProduction()) {
                            return `https://${helpCenter.subdomain}.gorgias.help${from}`
                        }
                        if (isStaging()) {
                            return `https://${helpCenter.subdomain}.gorgias.xyz${from}`
                        }
                        return `http://acme.gorgias.docker:4000${from}`
                    }

                    return (
                        <Fragment key={redirect.id}>
                            Try visiting:{' '}
                            <a
                                rel="noreferrer"
                                target="_blank"
                                href={buildRedirectUrl(redirect.from)}
                            >
                                {buildRedirectUrl(redirect.from)}
                            </a>
                            <li
                                style={{
                                    margin: '10 0',
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    alignItems: 'flex-end',
                                }}
                            >
                                <InputField
                                    type="text"
                                    value={redirect.from}
                                    isDisabled
                                />
                                <InputField
                                    type="text"
                                    value={redirect.to}
                                    isDisabled
                                />
                                <Button
                                    intent="destructive"
                                    onClick={() =>
                                        handleDeleteRedirect(redirect.from)
                                    }
                                >
                                    Delete
                                </Button>
                            </li>
                            <hr />
                        </Fragment>
                    )
                })}
            </ul>
        </section>
    )
}
