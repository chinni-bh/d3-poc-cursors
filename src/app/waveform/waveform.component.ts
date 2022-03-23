import { Component, OnInit } from '@angular/core';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { WaveformData } from "../shared/machine-data"

@Component({
  selector: 'app-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.scss']
})
export class WaveformComponent implements OnInit {
 private margin = { top: 200, right: 200, bottom: 300, left: 500 };
 private width: number;
 private height: number;
 private x: any;
 private y: any;
 private svg: any;
 private line: d3Shape.Line<[number, number]> | undefined;
 constructor() {
  this.width = 900 - this.margin.left - this.margin.right;
  this.height = 500 - this.margin.top - this.margin.bottom;
 }

 ngOnInit() {
  this.initSvg();
  this.initAxis();
  this.drawAxis();
  this.drawLine();
 }

 private initSvg() {

  this.svg = d3Selection
   .select('svg')
   .append('g')
   .attr(
    'transform',
    'translate(' + this.margin.left + ',' + this.margin.top + ')'
   );
   }

 private initAxis() {
  this.x = d3Scale.scaleLinear().range([0, this.width]);
  this.y = d3Scale.scaleLinear().range([this.height, 0]);
  this.x.domain(d3Array.extent(WaveformData, (d) => d.x_value));
  this.y.domain(d3Array.extent(WaveformData, (d) => d.y_value));
 }

 private drawAxis() {
  this.svg
   .append('g')
   .attr('class', 'axis axis--x')
   .attr('transform', 'translate(0,' + this.height + ')')
   .call(d3Axis.axisBottom(this.x));

  this.svg
   .append('g')
   .attr('class', 'axis axis--y')
   .call(d3Axis.axisLeft(this.y))
   .append('text')
   .attr('class', 'axis-title')
   .attr('transform', 'rotate(-90)')
   .attr('y', 6)
   .attr('dy', '.71em')
   .style('text-anchor', 'end')
   .text('Price ($)');
 }

 private drawLine() {
  this.line = d3Shape
   .line()
   .x((d: any) => this.x(d.x_value))
   .y((d: any) => this.y(d.y_value));

  this.svg
    .append('path')
    .datum(WaveformData)
    .attr('class', 'line')
    .attr("d", this.line)
    .style("fill", "none")
    .style("stroke", "#CC0000")
    .style("stroke-width", "1");
 }

}
