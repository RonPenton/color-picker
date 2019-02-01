import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Row, Col, Navbar, ButtonToolbar, Button, Modal } from 'react-bootstrap';
import { Palette, BasicPalette, PickedColor, PaletteEntry, calculateColor, addPickedColor, removePickedColor, rgbToHex, rgb2lab, hexToRGB, deltaE, getTextColor, rgbToHsv } from './Palette';
import { PalettePicker } from './PalettePicker';
import "./index.css";
import * as _ from 'lodash';


interface AppState {
    palette: Palette;
    pickedColor: PickedColor;
    matchColor: string;
    won: boolean;
}

export class App extends React.Component<{}, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            palette: BasicPalette,
            pickedColor: {},
            matchColor: this.getNewColor(),
            won: false
        }
    }

    newColor = () => {
        this.setState({ matchColor: this.getNewColor() });
    }

    reset = () => {
        this.setState({ pickedColor: {} });
    }

    getNewColor() {
        return rgbToHex({
            r: _.random(255),
            g: _.random(255),
            b: _.random(255)
        });
    }

    render() {
        const color = calculateColor(this.state.pickedColor);
        const diff = `${Math.round(this.calculateDifference() * 100) / 100}%`;

        return <div>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand>
                    Color Picker
                </Navbar.Brand>
            </Navbar>
            <div>
                <Row>
                    <Col xs={12}>
                        <ButtonToolbar>
                            <Button variant="primary" onClick={this.reset}>Reset</Button>
                            <Button variant="primary" onClick={this.newColor}>New Color</Button>
                            {/* <Button variant="secondary">Secondary</Button>
                            <Button variant="success">Success</Button>
                            <Button variant="warning">Warning</Button>
                            <Button variant="danger">Danger</Button> */}
                        </ButtonToolbar>
                    </Col>
                </Row>
                <Row className="justify-content-md-center">
                    <Col xs={6} className="nopad-right">
                        <div className="colorbox"
                            style={{
                                backgroundColor: rgbToHex(color),
                                color: getTextColor(color)
                            }}>
                            <div>
                                <span>Difference:&nbsp;</span>
                                <span>{diff}</span>
                            </div>
                        </div>
                    </Col>
                    <Col xs={6} className="nopad-left">
                        <div className="colorbox"
                            style={{ backgroundColor: this.state.matchColor }}>
                        </div>
                    </Col>
                </Row>
                <PalettePicker
                    palette={this.state.palette}
                    picked={(entry, q) => this.addColor(entry, q)}
                    pickedColor={this.state.pickedColor}
                >
                </PalettePicker>
            </div>

            <Modal show={this.state.won} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>You won!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>Awww yiss!</div>
                    <div>{`Your Pick: ${rgbToHex(color)}`}</div>
                    <div>{`Actual Color: ${this.state.matchColor}`}</div>
                    <div>{`Difference (according to scienticians an' shit): ${diff}`}</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleClose}>
                        New Game
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    }

    handleClose = () => {
        this.setState({
            palette: BasicPalette,
            pickedColor: {},
            matchColor: this.getNewColor(),
            won: false
        })
    }

    calculateDifference(picked?: PickedColor) {
        if (!picked)
            picked = this.state.pickedColor;

        const a = rgb2lab(calculateColor(picked));
        const b = rgb2lab(hexToRGB(this.state.matchColor));
        const difference = deltaE(a, b);

        // alright. Something's wrong with the algorithm. Eh. Close enough. 
        return difference > 100 ? 100 : difference;
    }

    addColor(entry: PaletteEntry, quantity: number) {
        const pickedColor = quantity > 0 ?
            addPickedColor(this.state.pickedColor, entry.color) :
            removePickedColor(this.state.pickedColor, entry.color);

        const difference = this.calculateDifference(pickedColor);
        const won = difference <= 1 ? true : false;
        this.setState({ pickedColor, won });
    }
}


ReactDOM.render(
    <App />,
    document.getElementById('react'));