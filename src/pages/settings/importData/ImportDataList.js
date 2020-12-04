//@flow
import React from 'react'
import {Alert, Table} from 'reactstrap'
import {Link} from 'react-router'

import {connect} from 'react-redux'

import {isImportAllowed} from '../../../state/integrations/selectors.ts'

type ImportDataListProps = {
    isImportAllowed: boolean,
    configs: Array<*>,
}

@connect((state) => {
    return {
        isImportAllowed: isImportAllowed(state),
        configs: [
            {
                img: `${
                    window.GORGIAS_ASSETS_URL || ''
                }/static/private/img/integrations/zendesk.png`,
                title: 'Zendesk',
                description:
                    'Import tickets, agents, admins, end-users and macros',
                link: '/app/settings/import-data/zendesk',
            },
        ],
    }
})
export default class ImportDataList extends React.Component<ImportDataListProps> {
    importNotAllowedAlert = () => (
        <Alert color="warning">
            You must add an Email, Gmail or Outlook integration to be able to
            start a data import.
        </Alert>
    )

    render() {
        return (
            <div>
                {this.props.isImportAllowed ? '' : this.importNotAllowedAlert()}
                <Table hover={this.props.isImportAllowed} cursor="">
                    <tbody>
                        {this.props.configs.map((config, idx) => {
                            return (
                                <tr key={idx}>
                                    <td className="smallest">
                                        <img
                                            alt={`${config.title} logo`}
                                            style={{
                                                maxWidth: '35px',
                                                overflow: 'hidden',
                                            }}
                                            className="rounded"
                                            src={config.img}
                                        />
                                    </td>
                                    <td className="link-full-td">
                                        <Link
                                            style={{
                                                cursor: this.props
                                                    .isImportAllowed
                                                    ? 'pointer'
                                                    : 'not-allowed',
                                            }}
                                            onClick={
                                                this.props.isImportAllowed
                                                    ? (e) => e.originalEvent
                                                    : (e) => e.preventDefault()
                                            }
                                            to={config.link}
                                        >
                                            <div>
                                                <b className="mr-2">
                                                    {config.title}
                                                </b>

                                                <span className="text-faded">
                                                    {config.description}
                                                </span>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="smallest align-middle">
                                        <i className="material-icons">
                                            chevron_right
                                        </i>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>
        )
    }
}
