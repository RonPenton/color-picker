import * as React from 'react';
import * as ReactDOM from 'react-dom';


export class App extends React.Component {
    constructor(props: any) {
        super(props);
    }

    render() {
        return <div>Hello!</div>;
    }
}



ReactDOM.render(
    <App />,
    document.getElementById('react'));