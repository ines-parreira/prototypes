import React from 'react'
import {Table} from 'reactstrap'
import {Link} from 'react-router'

const config = [
    {
        img: `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/integrations/zendesk.png`,
        title: 'Zendesk',
        description: 'Import tickets, users and macros',
        link: '/app/settings/import-data/zendesk'
    }
]


export default class ImportDataList extends React.Component {
    render() {
        return (
            <Table hover>
                <tbody>
                {
                    config.map((c, idx) => {
                        return (
                            <tr key={idx}>
                                <td className="smallest">
                                    <img
                                        style={{
                                            maxWidth: '35px',
                                            overflow: 'hidden',
                                        }}
                                        className="rounded"
                                        src={c.img}
                                    />
                                </td>
                                <td className="link-full-td">
                                    <Link to={c.link}>
                                        <div>
                                            <b className="mr-2">{c.title}</b>
                                            <span className="text-faded">
                                                {c.description}
                                            </span>
                                        </div>
                                    </Link>
                                </td>
                                <td className="smallest align-middle">
                                    <i className="fa fa-angle-right"/>
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
