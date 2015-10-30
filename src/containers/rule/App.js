import React from 'react'
import RuleForm from '../../components/rule/RuleForm'
import RuleList from '../../components/rule/RuleList'
import reqwest from 'reqwest'

class RuleBox extends React.Component {
    constructor() {
        super()
        this.handleCommentSubmit = this.handleCommentSubmit.bind(this)
        this.state = {data: []}
    }

    handleCommentSubmit(comment) {
        reqwest({
            url: this.props.url,
            type: 'json',
            method: 'POST',
            data: JSON.stringify(comment),
            contentType: "application/json",
            success: function (data) {
                this.setState({data: this.state.data.concat([data])})
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        })
    }

    componentDidMount() {
        reqwest({
            url: this.props.url,
            type: 'json',
            method: 'get',
            contentType: "application/json",
            success: function (data) {
                this.setState({data: data['data']})
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString())
            }.bind(this)
        })
    }

    render() {
        return (
            <div className="row ruleBox">
                <div className="col-md-12">
                    <h3>Rules</h3>
                    <RuleList data={this.state.data}/>

                    <h3>Adding a new rule</h3>
                    <RuleForm onCommentSubmit={this.handleCommentSubmit}/>
                </div>
            </div>
        )
    }
}

export default RuleBox