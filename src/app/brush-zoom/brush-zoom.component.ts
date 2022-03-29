import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { STOCKS } from '../shared/stocks';
import * as d3Array from 'd3-array';
import * as d3Scale from 'd3-scale';
import * as d3Axis from 'd3-axis';

@Component({
  selector: 'app-brush-zoom',
  templateUrl: './brush-zoom.component.html',
  styleUrls: ['./brush-zoom.component.scss'],
})
export class BrushZoomComponent implements OnInit {
  public data = STOCKS;
  public x: any;
  private y: any;
  private idleTimeout: any;
  private xAxis: any;
  private yAxis: any;
  private brush: any;
  private area: any;
  private areaGenerator: any;
  private svg: any;
  private Xval: any;
  public name = 'chandra';
  public g: any;

  ngOnInit(): void {
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    this.svg = d3
      .select('#my_dataviz')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    this.x = d3Scale.scaleTime().range([0, width]);
    this.x.domain(d3Array.extent(STOCKS, (d) => d.date));

    this.xAxis = this.svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(this.x));

    this.y = d3Scale.scaleLinear().range([height, 0]);
    this.y.domain(d3Array.extent(STOCKS, (d) => d.value));

    console.log('y values', this.y, 'end');
    this.yAxis = this.svg
      .append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(this.y));

    const clip = this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('x', 0)
      .attr('y', 0);

    // Add brushing
    // this.brush = d3
    //   .brushX() // Add the brush feature using the d3.brush function
    //   .extent([
    //     [0, 0],
    //     [width, height],
    //   ])
    //   .on('end', () => this.updateChart); // Each time the brush selection changes, trigger the 'updateChart' function

    this.brush = this.svg
      .append('g')
      .attr('class', 'brush')
      .call(d3.brushX().on('end', this.updateChart.bind(this)));
    console.log('After brush', this.x);

    // Create the area variable: where both the area and the brush take place
    this.area = this.svg.append('g').attr('clip-path', 'url(#clip)');

    // Create an area generator
    this.areaGenerator = d3
      .area()
      .x((d: any) => this.x(d.date))
      .y0(this.y(0))
      .y1((d: any) => this.y(d.value));

    // Add the area
    this.area
      .append('path')
      .datum(this.data)
      .attr('class', 'myArea') // I add the class myArea to be able to modify it later on.
      .attr('fill', '#69b3a2')
      .attr('fill-opacity', 0.3)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('d', this.areaGenerator);

    // Add the brushing
    // this.area.append('g').attr('class', 'brush').call(this.brush);
  }

  public updateChart(event: any): any {
    const extent = event.selection;
    console.log('Update chart', event);
    console.log('this.x', this.x);
    console.log('name', this.name);
    console.log('extent value', extent);
    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if (!extent) {
      if (!this.idleTimeout)
        return (this.idleTimeout = setTimeout(this.idled, 350)); // This allows to wait a little bit
      this.x.domain([4, 8]);
    } else {
      console.log('extent value', extent);
      console.log('x values', this.x);
      console.log('extent', this.x.invert(171));
      console.log('extent', this.x.invert(extent[0]));

      this.x.domain([this.x.invert(extent[0]), this.x.invert(extent[1])]);
      // this.area.select('.brush').call(this.brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }
    this.xAxis.transition().duration(1000).call(d3.axisBottom(this.x));
    this.area
      .select('.myArea')
      .transition()
      .duration(1000)
      .attr('d', this.areaGenerator);

    // this.svg('dblclick', () => {
    //   this.x.domain(d3.extent(this.data, (d) => d.date));
    //   this.xAxis.transition().call(d3.axisBottom(this.x));
    //   this.area.select('.myArea').transition().attr('d', this.areaGenerator);
    // });
  }

  private idled() {
    this.idleTimeout = null;
  }
}
