import {
  Component,
  ViewEncapsulation,
  OnInit,
  HostListener,
} from '@angular/core';

import * as d3 from 'd3';
import { STOCKS } from '../shared/stocks';
import * as d3Scale from 'd3-scale';

@Component({
  selector: 'app-line-zoom',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './line-zoom.component.html',
  styleUrls: ['./line-zoom.component.css'],
})
export class LineZoomComponent implements OnInit {
  title = 'Line Chart';
  private data = STOCKS;
  private idleTimeout: any;
  private line: any;
  private brush: any;
  private clip: any;
  private svg: any;
  private x: any;
  private y: any;
  private xAxis: any;
  private yAxis: any;
  private margin = { top: 10, right: 30, bottom: 30, left: 60 };
  private width = 460 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  ngOnInit(): void {
    this.svg = d3
      .select('#my_dataviz')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.initChart();
  }
  private parse(d: any) {
    return { date: d3.timeParse('%Y-%m-%d')(d.date), value: d.value };
  }
  private initChart() {
    this.parse(this.data);
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.x.domain(
      d3.extent(this.data, (d) => {
        return d.date;
      })
    );

    this.xAxis = this.svg
      .append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(this.x));

    this.y = d3Scale
      .scaleLinear()
      .domain([
        0,
        d3.max(this.data, (d: any) => {
          return d.value;
        }),
      ])
      .range([this.height, 0]);

    this.yAxis = this.svg.append('g').call(d3.axisLeft(this.y));

    this.clip = this.svg
      .append('defs')
      .append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('x', 0)
      .attr('y', 0);

    this.brush = d3
      .brushX()
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('end', this.updateChart);

    this.line = this.svg.append('g').attr('clip-path', 'url(#clip)');
    this.line
      .append('path')
      .datum(this.data)
      .attr('class', 'line') // I add the class line to be able to modify this line later on.
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x((d: any) => {
            return this.x(d.date);
          })
          .y((d: any) => {
            return this.y(d.value);
          })
      );
    this.line.append('g').attr('class', 'brush').call(this.brush);

    this.svg.on('dblclick', () => {
      this.x.domain(
        d3.extent(this.data, (d) => {
          return d.date;
        })
      );
      this.xAxis.transition().call(d3.axisBottom(this.x));
      this.line
        .select('.line')
        .transition()
        .attr(
          'd',
          d3
            .line()
            .x((d: any) => {
              return this.x(d.date);
            })
            .y((d: any) => {
              return this.y(d.value);
            })
        );
    });
  }
  private updateChart(event: any): any {
    let extent = event.selector;
    if (!extent) {
      if (!this.idleTimeout)
        return (this.idleTimeout = setTimeout(this.idled, 350)); // This allows to wait a little bit
      this.x.domain([4, 8]);
    } else {
      this.x.domain([this.x.invert(extent[0]), this.x.invert(extent[1])]);
      this.line.select('.brush').call(this.brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }
    this.xAxis.transition().duration(1000).call(d3.axisBottom(this.x));
    this.line
      .select('.line')
      .transition()
      .duration(1000)
      .attr(
        'd',
        d3
          .line()
          .x((d: any) => {
            return this.x(d.date);
          })
          .y((d: any) => {
            return this.y(d.value);
          })
      );
  }
  private idled() {
    this.idleTimeout = null;
  }
}
