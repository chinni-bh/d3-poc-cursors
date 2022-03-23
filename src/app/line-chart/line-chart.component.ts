import {
  Component,
  ViewEncapsulation,
  OnInit,
  HostListener,
} from '@angular/core';

import * as d3 from 'd3';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { STOCKS } from '../shared/stocks';
import { zoom } from 'd3';

@Component({
  selector: 'app-line-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css'],
})
export class LineChartComponent implements OnInit {
  title = 'Line Chart';

  // @HostListener('window:keyup', ['$event'])
  // keyEvent(event: KeyboardEvent) {
  //   if (event.key == 'ArrowUp') {
  //     // Your row selection code
  //     console.log(event);
  //   }
  // }

  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private width: number;
  private height: number;

  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]> | undefined;
  private handler = zoom();
  private Mouseevents = [
    'click',
    'mouseover',
    'mouseenter',
    'mouseleave',
    'mousemove',
    'mousedown',
    'mouseup',
  ];
  private KeyboardEvents = ['keyup', 'keydown', 'keyleft', 'keyright'];
  constructor() {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit() {
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawLine();

    let zoom = d3.zoom();
  }

  private initSvg() {
    this.svg = d3Selection
      .select('svg')
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );

    this.Mouseevents.map((e) => {
      this.svg.on(e, () => {
        console.log('triggerd', event?.type);
        console.log(event);
      });
    });

    this.KeyboardEvents.map((e) => {
      d3Selection.select('body').on(e, () => {
        console.log('triggerd', event);
      });
    });
    // d3.select('svg').on('mouseover', (event) => {
    //   console.log(event);
    // });
    // d3.select('body').on('keydown', (event) => {
    //   console.log(event);
    // });
  }

  private initAxis() {
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(STOCKS, (d) => d.date));
    this.y.domain(d3Array.extent(STOCKS, (d) => d.value));
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
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.value));

    this.svg
      .append('path')
      .datum(STOCKS)
      .attr('class', 'line')
      .attr('d', this.line)
      .append('g');
  }
  public zoomed() {
    let zoomSvg = this.svg;
    this.svg.select('svg').call(
      d3.zoom().on('zoom', (event) => {
        zoomSvg.attr('transform', event.transform);
      })
    );
  }
}
