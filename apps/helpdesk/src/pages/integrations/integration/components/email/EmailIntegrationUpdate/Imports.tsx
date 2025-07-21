import { ReactNode } from 'react'

import { Map } from 'immutable'
import { Link } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'

type Props = {
    importActivated: boolean
    status: string
    mailsImported: number
    importDescription: ReactNode
    importMethod: () => any
    integration: Map<any, any>
    loading: Map<any, any>
}
const Imports = ({
    importActivated,
    status,
    mailsImported,
    importDescription,
    importMethod,
    integration,
    loading,
}: Props) => {
    const dispatch = useAppDispatch()
    const email = integration.getIn(['meta', 'address'], '')

    const isLoading = loading.get('import') === integration.get('id')
    const isImporting = status === 'started' || (importActivated && !status)

    const handleImport = async () => {
        const action = importMethod()
        return dispatch(action)
    }

    const statusSentence = isImporting ? (
        <span>
            We are currently importing emails from{' '}
            <span className="font-weight-bold">{email}</span> into Gorgias. You
            can see its progress here:{' '}
            <Link to="/app/tickets">All tickets</Link>
        </span>
    ) : (
        <Alert type={AlertType.Success} icon className="mt-3">
            Completed: <span className="font-weight-bold">{mailsImported}</span>{' '}
            emails have been imported.
        </Alert>
    )

    return (
        <>
            <p>
                {isImporting && (
                    <i className="material-icons md-spin mr-2">autorenew</i>
                )}
                {importActivated ? (
                    statusSentence
                ) : (
                    <p>
                        Import {importDescription} from{' '}
                        <span className="font-weight-bold">{email}</span> as
                        closed tickets.
                    </p>
                )}
            </p>
            {!importActivated && (
                <ConfirmButton
                    isLoading={isLoading}
                    onConfirm={handleImport}
                    confirmationContent="Are you sure you want to import emails?"
                    intent="secondary"
                >
                    Import emails
                </ConfirmButton>
            )}
        </>
    )
}

export default Imports
