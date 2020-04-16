import React, { Component } from "react";

import {
    ComposableMap,
    Geographies,
    Geography,
} from "react-simple-maps"

export default class chloropeth extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {},
        };
    }

    componentDidMount() {

    }



    render() {
        const COLOR_RANGE = [
            '#ffedea',
            '#ffcec5',
            '#ffad9f',
            '#ff8a75',
            '#ff5533',
            '#e2492d',
            '#be3d26',
            '#9a311f',
            '#782618'
        ];

        const PROJECTION_CONFIG = {
            scale: 40000,
            center: [72.5714, 23.0225]
        };
        return (
            <div>
                <ComposableMap projectionConfig={PROJECTION_CONFIG} projection="geoMercator" width={200}
                    height={200}>
                    <Geographies geography={"/boundary.json"}>
                        {({ geographies }) => geographies.map(geo => {
                            const { pin_code } = geo.properties;
                            return <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                onMouseEnter={() => {
                                    console.log("entered");
                                    const { name } = geo.properties;
                                    console.log(name)
                                    this.props.setTooltipContent(`${name}`);
                                }}
                                onMouseLeave={() => {
                                    console.log("exited");
                                    this.props.setTooltipContent("");
                                }}
                                style={{
                                    default: {
                                        fill: COLOR_RANGE[pin_code % 8],
                                        outline: "none"
                                    },
                                    hover: {
                                        fill: "#F53",
                                        outline: "none"
                                    },
                                    pressed: {
                                        fill: "#E42",
                                        outline: "none"
                                    }
                                }}
                            />
                        })}
                    </Geographies>
                </ComposableMap>
            </div>
        );
    }
}
