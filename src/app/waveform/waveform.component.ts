import { Component, OnInit } from '@angular/core';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { WaveformData } from '../shared/machine-data';
import { SpectrumData } from '../shared/spectrum-data';
import * as d3 from 'd3';
import { BehaviorSubject } from 'rxjs';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.scss'],
})
export class WaveformComponent implements OnInit {
  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  X: any;
  cursor_readout: any;
  basic_cursor_A: any;
  cursor_A_postion: number = 400;
  cursor_B_postion: number = 500;
  basic_cursor_B: any;
  current_cursor: any;
  c_id: number = 0;
  cursor_point = new BehaviorSubject<Number | number>(0);
  index: any;
  isHarmonic: boolean = false;
  private line: d3Shape.Line<[number, number]> | undefined;

  private deltaForSideband = 2;

  constructor() {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.cursor_readout = d3.select('readout');
  }

  ngOnInit() {
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawLine();
    this.renderCursor();
  }

  private initSvg() {
    this.svg = d3Selection
      .select('svg')
      // .on('click', (event: any) => this.mouseClick(event))
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
      .call(d3Axis.axisLeft(this.y));
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
      .attr('d', this.line)
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-width', '0.5');
  }

  private renderCursor() {
    this.basic_cursor_A = this.svg
      .append('g')
      .selectAll('.cursor')
      .data([1])
      .enter()
      .append('image')
      .attr('xlink:href', '../../assets/star-e.svg')
      .attr('id', 'A')
      .style('width', '12px')
      .style('height', '30px')
      .attr('x', this.x(WaveformData[this.cursor_A_postion].x_value) - 5)
      .attr('y', this.y(WaveformData[this.cursor_A_postion].y_value) - 5)
      .on('click', (event: any) => this.mouseClick(event));
    this.X = WaveformData.map((data) => data.x_value);
  }

  public renderNewCursor() {
    // this.cursor_A_postion += 10;
    this.basic_cursor_B = this.svg
      .append('g')
      .selectAll('.cursor')
      .data([1])
      .enter()
      .append('image')
      .attr('xlink:href', '../../assets/star.svg')
      .attr('id', 'B')
      .style('width', '13px')
      .style('height', '30px')
      .attr('x', this.x(WaveformData[this.cursor_B_postion].x_value) - 6)
      .attr('y', this.y(WaveformData[this.cursor_B_postion].y_value) - 15)
      .on('click', (event: any) => this.mouseClick(event));
  }

  public mouseClick = (event: any) => {
    // alert();
    //index of nearest clicked x-value
    // let index = d3.bisectCenter(
    //   this.X,
    //   this.x.invert(d3.pointer(event)[0] - 49)
    // );
    // let x_coordinates = +WaveformData[index].x_value;

    let x_coordinates =
      +WaveformData[
        event.target.id === 'A' ? this.cursor_A_postion : this.cursor_B_postion
      ].x_value;

    console.log('coordinates x', x_coordinates);
    //index of first, right-side-band
    let index1 = d3.bisectCenter(this.X, x_coordinates + this.deltaForSideband);
    let nextXValSideBand = x_coordinates + this.deltaForSideband;

    while (nextXValSideBand < this.X[this.X.length - 1]) {
      index1 = d3.bisectCenter(this.X, nextXValSideBand);
      console.log(index1, nextXValSideBand);

      this.svg
        .append('g')
        .selectAll('.cursor')
        .data([1])
        .enter()
        .append('image')
        .attr('xlink:href', '../../assets/circle.svg')
        .style('width', '10px')
        .style('height', '10px')
        .attr('x', this.x(WaveformData[index1].x_value) - 5)
        .attr('y', this.y(WaveformData[index1].y_value) - 5);
      nextXValSideBand += this.deltaForSideband;
    }

    index1 = d3.bisectCenter(this.X, x_coordinates + this.deltaForSideband);
    let prevXValSideBand = x_coordinates - this.deltaForSideband;
    while (prevXValSideBand > this.X[0]) {
      index1 = d3.bisectCenter(this.X, prevXValSideBand);
      this.svg
        .append('g')
        .selectAll('.cursor')
        .data([1])
        .enter()
        .append('image')
        .attr('xlink:href', '../../assets/circle.svg')
        .style('width', '10px')
        .style('height', '10px')
        .attr('x', this.x(WaveformData[index1].x_value) - 5)
        .attr('y', this.y(WaveformData[index1].y_value) - 5);
      prevXValSideBand -= this.deltaForSideband;
    }
    console.log(this.index, 'this.index basic');
  };

  public ToggleEnable() {
    let harmonic_index = 0;
    // let index_1:any,index_2:any;
    this.isHarmonic = !this.isHarmonic;
    let c = 1;
    let image_link: string = '';
    let harmonic_cursor;
    this.cursor_point.subscribe((value: any) => {
      if (this.isHarmonic) {
        this.svg.selectAll('basic').remove();
        c = 1;
        harmonic_index = 0;
        if (this.c_id == 0) {
          image_link = '../../assets/starburst.svg';
        } else {
          image_link = '../../assets/machine.svg';
        }
        // console.log(this.X.length);

        while (harmonic_index < 2000) {
          harmonic_index = d3.bisectCenter(this.X, value * c);
          harmonic_cursor = this.svg
            .append('g')
            .append('image')
            .attr('class', 'basic')
            .attr('xlink:href', image_link)
            .style('width', '10px')
            .style('height', '10px')
            .attr('x', this.x(WaveformData[harmonic_index].x_value) - 5)
            .attr('y', this.y(WaveformData[harmonic_index].y_value) - 5);
          console.log(
            'X:',
            WaveformData[harmonic_index].x_value,
            'Y:',
            WaveformData[harmonic_index].y_value
          );
          c++;
        }
      }
    });
  }

  public ToggleCursor() {
    this.c_id = this.c_id ^ 1;
  }
}
