import React from 'react'
import {Table} from 'reactstrap'
import {Link} from 'react-router'

const configs = [
    {
        img: `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/integrations/zendesk.png`,
        title: 'Zendesk',
        description: 'Import tickets, agents, admins, end-users and macros',
        link: '/app/settings/import-data/zendesk'
    }
]


export default class ImportDataList extends React.Component {
    render() {
        return (
            <Table hover>
                <tbody>
                    {
                        configs.map((config, idx) => {
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
                                        <Link to={config.link}>
                                            <div>
                                                <b className="mr-2">{config.title}</b>
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
                        })
                    }
                </tbody>
            </Table>
        )
    }
}
