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
  Y: any;
  cursor_readout: any;
  basic_cursor_A: any;
  cursor_A_postion: number = 300;
  cursor_B_postion: number = 320;
  basic_cursor_B: any;
  current_cursor: any;
  c_id: number = 0;
  cursor_point = new BehaviorSubject<Number | number>(0);
  index: any;
  isHarmonic: boolean = false;
  private line: d3Shape.Line<[number, number]> | undefined;

  deltaForSideband = 2;
  bisect: any;

  constructor() {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.cursor_readout = d3.select('readout');
  }

  ngOnInit() {
    this.X = WaveformData.map((data) => data.x_value);
    this.Y = WaveformData.map((data) => data.y_value);
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
      .attr('id', 'cursor-a')
      .style('width', '12px')
      .style('height', '30px')
      .attr('x', this.x(WaveformData[this.cursor_A_postion].x_value) - 5)
      .attr('y', this.y(WaveformData[this.cursor_A_postion].y_value) - 5)
      .on('click', (event: any) => this.mouseClick(event));

    this.basic_cursor_B = this.svg
      .append('g')
      .selectAll('.cursor')
      .data([1])
      .enter()
      .append('image')
      .attr('xlink:href', '../../assets/star.svg')
      .attr('id', 'cursor-b')
      .style('width', '13px')
      .style('height', '30px')
      .attr('x', this.x(WaveformData[this.cursor_B_postion].x_value) - 6)
      .attr('y', this.y(WaveformData[this.cursor_B_postion].y_value) - 15)
      .on('click', (event: any) => this.mouseClick(event));

    // This allows to find the closest X index of the mouse:
    // this.bisect = d3.bisector((d: any) => {
    //   return d.x;
    // }).left;
  }

  public renderNewCursor() {
    // this.cursor_A_postion += 10;
  }

  leftSideBandClick(event: any) {
    // throw new Error('Method not implemented.');
    console.log(event);
  }
  rightSideBandClick(event: any) {
    // throw new Error('Method not implemented.');
    console.log(event);
  }

  public mouseClick = (event: any) => {
    let sideBandIdIndex = 0;

    let id_extension = '';
    if (event.target.id === 'cursor-a') {
      id_extension = 'a';
    }
    let x_coordinates =
      +WaveformData[
        id_extension === 'a' ? this.cursor_A_postion : this.cursor_B_postion
      ].x_value;
    console.log('Base Band', x_coordinates);
    //index of first, right-side-band
    let nextXValSideBand = x_coordinates; //x_coordinates + this.deltaForSideband;
    let indexOfNextSideBand = 0; //d3.bisectCenter(this.X, nextXValSideBand);

    while (
      nextXValSideBand + this.deltaForSideband <
      this.X[this.X.length - 1]
    ) {
      nextXValSideBand += this.deltaForSideband;
      indexOfNextSideBand = d3.bisectCenter(this.X, nextXValSideBand);
      this.svg
        .append('g')
        .selectAll('.cursor')
        .data([1])
        .enter()
        .append('image')
        .attr('xlink:href', '../../assets/circle.svg')
        .attr('id', 'r-side-band-' + sideBandIdIndex++)
        .style('width', '10px')
        .style('height', '10px')
        .attr('x', this.x(WaveformData[indexOfNextSideBand].x_value) - 5)
        .attr('y', this.y(WaveformData[indexOfNextSideBand].y_value) - 5)
        .on('click', (event: any) => this.rightSideBandClick(event));
      console.log(
        'r-side-band-' + (sideBandIdIndex - 1),
        ' \n next x-vlaue',
        nextXValSideBand,
        '\n WaveformIndex-Next sideband: ',
        WaveformData[indexOfNextSideBand].x_value
      );
    }

    let prevXValSideBand = x_coordinates;
    indexOfNextSideBand = 0;
    while (prevXValSideBand - this.deltaForSideband > this.X[0]) {
      prevXValSideBand -= this.deltaForSideband;
      indexOfNextSideBand = d3.bisectCenter(this.X, prevXValSideBand);
      this.svg
        .append('g')
        .selectAll('.cursor')
        .data([1])
        .enter()
        .append('image')
        .attr('xlink:href', '../../assets/circle.svg')
        .attr('id', 'l-side-band-' + sideBandIdIndex++)
        .style('width', '10px')
        .style('height', '10px')
        .attr('x', this.x(WaveformData[indexOfNextSideBand].x_value) - 5)
        .attr('y', this.y(WaveformData[indexOfNextSideBand].y_value) - 5)
        .on('click', (event: any) => this.leftSideBandClick(event));
      console.log(
        'l-side-band-' + (sideBandIdIndex - 1),
        ' \n prev x-vlaue',
        prevXValSideBand,
        '\n WaveformIndex-Next sideband: ',
        indexOfNextSideBand
      );
    }
    let startX = 0,
      endX = 0;
    let drag = d3
      .drag()
      .on('start', (d: any) => {
        // d3.select(this).raise().classed('active', true);
        // console.log(
        //   d.type,
        //   ' : \nd.x',
        //   d.x,
        //   ' \nd.y,',
        //   d.y,
        //   ' \nd.dx',
        //   d.dx,
        //   ' \nd.dy',
        //   d.dy
        // );
        var x0 = this.x.invert(d.x);
        // var y0 = this.y.invert(d.y);
        let coordinates = WaveformData[d3.bisectCenter(this.X, x0)];
        console.log('start - ', coordinates);

        startX = d.x;
      })
      .on('end', (d: any) => {})
      .on('drag', (d: any) => {
        //to get the selected point

        // var x0 = this.x.invert(d.x);
        // let coordinates = WaveformData[d3.bisectCenter(this.X, x0)];
        // var y0 = this.y.invert(d.y);
        // console.log(WaveformData[d3.bisectCenter(this.X, x0)]);

        // console.log('x0', x0, 'y0', y0);
        // console.log(coordinates.x_value, coordinates.y_value);

        var x0 = this.x.invert(d.x);
        let coordinates = WaveformData[d3.bisectCenter(this.X, x0)];

        let arr = this.svg.selectAll("image[id*='side-band-']");
        let n = arr._groups[0][0].x.baseVal.value;
        let updatedCoordinates =
          WaveformData[d3.bisectCenter(this.X, this.x.invert(d.x))];
        let currentCoordinates =
          WaveformData[d3.bisectCenter(this.X, this.x.invert(startX))];

        let diffInXvalues = //startX - d.x;
          +updatedCoordinates.x_value - +currentCoordinates.x_value;
        console.log('UC', updatedCoordinates, 'CC', currentCoordinates);
        console.log('startX - d.x:  ', startX - d.x);

        this.deltaForSideband += diffInXvalues;

        arr._groups[0].forEach((node: any) => {
          // console.log(node.x.baseVal.value);
          // console.log(node.id);
          let updatedCoordinates1 =
            WaveformData[
              d3.bisectCenter(
                this.X,
                +WaveformData[
                  d3.bisectCenter(this.X, this.x.invert(node.x.baseVal.value))
                ].x_value + diffInXvalues
              )
            ];

          this.svg
            .select("image[id='" + node.id + "']")
            .attr('x', this.x(updatedCoordinates1.x_value) - 6)
            .attr('y', this.y(updatedCoordinates1.y_value) - 15);
          // console.log(updatedCoordinates1);
        });

        // arr
        //   .attr('x', this.x(coordinates.x_value) - 6)
        //   .attr('y', this.y(coordinates.y_value) - 15);

        // this.svg
        //   .select("image[id='l-side-band-6']")
        //   .attr('x', this.x(coordinates.x_value) - 6)
        //   .attr('y', this.y(coordinates.y_value) - 15);
      });

    this.svg.selectAll("image[id*='side-band-']").call(drag);
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
