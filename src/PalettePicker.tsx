import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Col, Row } from 'react-bootstrap';
import { Palette, PaletteEntry, rgbToHex, PickedColor, rgbToHsl, getTextColor } from './Palette';


interface PalettePickerProps {
    palette: Palette;
    pickedColor: PickedColor;
    picked: (entry: PaletteEntry, quantity: number) => void;
}


export const PalettePicker: React.SFC<PalettePickerProps> = (props) => {
    return <Row className="justify-content-md-center">
        {props.palette.map(x => {
            return <PaletteDrop
                entry={x}
                quantity={props.pickedColor[rgbToHex(x.color)]}
                picked={(q) => props.picked(x, q)} />
        })}
    </Row>
}



interface PaletteDropProps {
    entry: PaletteEntry;
    quantity: number;
    picked: (quantity: number) => void;
}

export const PaletteDrop: React.SFC<PaletteDropProps> = (props) => {
    const val = props.quantity || 0;

    const remove = val > 0 ?
        <button className="paletteDrop"
            onClick={() => props.picked(-1)}>
            {"-"}
        </button> :
        null;
    return <Col xs={1}>
        <button style={{
            backgroundColor: rgbToHex(props.entry.color),
            color: getTextColor(props.entry.color)
        }}
            className="paletteDrop" onClick={() => props.picked(1)}>
            {val}
        </button>
        {remove}
    </Col>
}