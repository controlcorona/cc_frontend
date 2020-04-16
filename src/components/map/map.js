import React, { useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson";
import './map.css';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json";

function Map({mapMeta}) {
    const [mapJson, setMapJson] = useState(mapMeta.geoFilePath);
    const [mapKey, setMapKey] = useState(mapMeta.key);
    const ready = useCallback(
        (geoData) => {
            var width = 800, height = 700, scale = 40000;
            var state = topojson.feature(geoData, geoData.objects[mapKey]);
            d3.select("#select").select("svg").remove();
            d3.select("#select").select("#tooltip").remove();
            d3.select("#select").append("div").attr("id", "tooltip").style("opacity", 0);

            var svg = d3.select("#select").append("svg")
                .attr("width", width)
                .attr("height", height);
            var projection = d3.geoMercator()
                .center([72.5714, 23.0225])
                .scale(scale);

            var path = d3.geoPath(projection);

            svg.selectAll(".district")
                .data(state.features)
                .enter().append("path")
                .attr("class", "district")
                .attr("fill", function (d) { return "#" + ((1 << 24) * Math.random() | 0).toString(16); })
                .attr("d", path)
                .on("mouseover", function (d) {
                    d3.select("#tooltip").transition()
                        .duration(200)
                        .style("opacity", .9);
                    d3.select("#tooltip").html("<h4>(" + (d.properties.area_name) + ")</h4>" )
                        .style("left", (d3.event.pageX - document.getElementById('select').offsetLeft + 20 ) + "px")
                        .style("top", (d3.event.pageY - document.getElementById('select').offsetTop - 150) + "px");
                })
                .on("mouseout", function (d) {
                    d3.select("#tooltip").transition()
                        .duration(500)
                        .style("opacity", 0);
                });

        });
    useEffect(() => {
        (async () => {
            const data = await d3.json(mapJson);
            console.log(data);
            ready(data);
        })();
    }, [mapJson]);

    return (
        <div id="map">
            <div id="select"></div>
        </div>
    );
};

export default Map;