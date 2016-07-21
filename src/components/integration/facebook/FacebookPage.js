import React, {PropTypes} from 'react'


export default class FacebookPage extends React.Component {

    render() {
        const { facebookIntegration, actions, onClick, allowEdit } = this.props
        const page = facebookIntegration.get('facebook')
        return (
            <tr className="FacebookPage" onClick={onClick}>
                <td>
                    <img alt={page.get('name')} src={page.getIn(['picture', 'data', 'url'])}/>
                </td>
                <td>
                    <div className="ui header">
                        <span className="subject">{page.get('name')}</span>

                        <div className="body sub header">
                            {page.get('category')}
                        </div>
                    </div>
                    <div>
                        {page.get('about')}
                    </div>
                </td>
                <td className="three wide middle aligned column" style={!allowEdit ? {display: 'none'} : {}}>
                    <button className="ui basic light blue floated right button"
                            onClick={() => actions.updateIntegration('facebook', facebookIntegration.get('id'))}
                    >
                        EDIT
                    </button>
                </td>
            </tr>
        )
    }

}


FacebookPage.propTypes = {
    facebookIntegration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    allowEdit: PropTypes.bool,
}
