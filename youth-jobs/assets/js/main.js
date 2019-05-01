//draw 考慮因素 chart (line graph)
let isRendered = false;
renderGraph();

window.onresize = function () {
    renderGraph();
}

function renderGraph() {
    d3.csv(`assets/csv/青年勞工初次尋職時選擇工作的考慮因素(fin)/total-2.csv`, function (error, data) {
        if (error) throw error;
        //check graph has been rendered or not
        //if it's rendered then remove the old graph
        if (isRendered == true) {
            d3.select("#display").html("");
        }

        //get graph correct width again
        Setting.graph.width = window.screen.width < 1080 ? window.screen.width : window.screen.width * 0.5;

        let graph = Linegraph.generateGraph(Setting.graph, `#display`);

        let width = Setting.graph.innerWidth();
        let height = Setting.graph.innerHeight();
        let x = Linegraph.generateXAxis(graph, data, width, height, `年份`);
        let y = Linegraph.generateYAxis(graph, data, height, `比率(%)`);

        document.getElementById(`display`).style.cursor = `crosshair`;

        let yearData = Linegraph.formatYearData(data, '2016');
        Linegraph.generateCheckboxEvent(yearData);

        Linegraph.appendbar(data.slice(60), graph, x)
            //append detailed data at panel
            .on(`mouseenter`, (d) => {

                let BarYearData = Linegraph.formatYearData(data, d.year);
                console.log(BarYearData);

                d3.select(d3.event.target)
                    .transition()
                    .duration(300)
                    .attr("opacity", 0.6)

                d3.select(`#stat`).append(`div`)
                    .attr("id", "temp-stat");

                d3.select(`#year`)
                    .text(`年份: ${d.year}`);

                for (item in BarYearData) {
                    d3.select(`#temp-stat`).append(`div`)
                        .style('color', (d) => {
                            return Setting[`color`][BarYearData[item].type];
                        })
                        .text(`${BarYearData[item].type} ${BarYearData[item].value}%`)
                }
            })
            .on(`mouseleave`, () => {
                d3.select(d3.event.target)
                    .transition()
                    .duration(300)
                    .attr("opacity", 0.2)
                d3.select(`#temp-stat`).remove()
            })

        //show tooltip when mousehover,remove it when mouseleave
        Linegraph.generateDot(data, graph, x, y)
            .on(`mouseenter`, (d, i) => {
                d3.select(d3.event.target)
                    .transition()
                    .duration(200)
                    .attr(`r`, (d) => {
                        if (d[`type`] == `待遇高` || d[`type`] == `工作穩定` || d[`type`] == `工作負擔較輕`||d[`type`]==`通勤方便`)
                            return Setting.circle.strong.hover.radius;
                        else return Setting.circle.normal.hover.radius;
                    })
                    .attr(`opacity`, (d) => {
                        if (d[`type`] == `待遇高` || d[`type`] == `工作穩定` || d[`type`] == `工作負擔較輕`||d[`type`]==`通勤方便`)
                            return Setting.circle.strong.hover.opacity;
                        else return Setting.circle.normal.hover.opacity;
                    });

                Linegraph.generateTooltip(d, i, graph, x, y, `%`);
                document.getElementById(`year`).innerText = `年份: ${d[`year`]}`;
                document.getElementById(`type`).innerText = `考慮因素: ${d[`type`]}`;
                document.getElementById(`value`).innerText = `所佔比率: ${d[`value`]}%`;


                yearData = Linegraph.formatYearData(data, d.year);

                d3.select(`#stat`).append(`div`)
                    .attr("id", "temp-stat");
                for (item in yearData) {
                    d3.select(`#temp-stat`).append(`div`)
                        .style('color', (d) => {
                            return Setting[`color`][yearData[item].type];
                        })
                        .text(`${yearData[item].type} ${yearData[item].value}%`)
                }
            })
            .on(`mouseleave`, () => {
                d3.select(d3.event.target)
                    .transition()
                    .duration(200)
                    .attr(`opacity`, (d) => {
                        if (d[`type`] == `待遇高` || d[`type`] == `工作穩定` || d[`type`] == `工作負擔較輕`||d[`type`]==`通勤方便`)
                            return Setting.circle.strong.default.opacity;
                        else return Setting.circle.normal.default.opacity;
                    })
                    .attr(`r`, (d) => {
                        if (d[`type`] == `待遇高` || d[`type`] == `工作穩定` || d[`type`] == `工作負擔較輕`||d[`type`]==`通勤方便`)
                            return Setting.circle.strong.default.radius;
                        else return Setting.circle.normal.default.radius;
                    })
                Linegraph.removeTooltip();

                d3.select(`#temp-stat`).remove()
            })
            .on(`click`, () => {
            });


        //format data for line,and draw graph
        let lineData = Linegraph.formatLineData(data);
        Linegraph.generateLine(lineData, graph, x, y)

        //append infomation icon svg
        Linegraph.generateInfo(graph, width, lineData, `info`)
            .on(`mouseenter`, () => {
                document.getElementById(`info`).style.visibility = `visible`;
            })
            .on(`mouseleave`, () => {
                document.getElementById(`info`).style.visibility = `hidden`;
            });

        for (let i = 0; i <= 10; i++) {
            if (document.getElementById(`box-${yearData[i][`type`]}`).checked) {
                d3.selectAll(`.${yearData[i][`type`]}`)
                    .attr('display', 'block')
                    .attr('opacity', 1)
            }
            else {
                d3.selectAll(`.${yearData[i][`type`]}`)
                    .attr('display', 'none')
                    .attr('opacity', 0);
            }
        }
        //graph rendered finished
        isRendered = true;

    });
}