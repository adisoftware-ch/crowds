import { Component, AfterViewInit, ViewChild, Renderer2 } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'crowd-playground',
  templateUrl: './crowd-playground.component.html',
  styleUrls: ['./crowd-playground.component.scss'],
})
export class CrowdPlaygroundComponent implements AfterViewInit {

  @ViewChild('crowdPlayground', null) canvas: any;

  canvasElement: any;

  width: number;
  height: number;

  males: Array<Square>;
  females: Array<Square>;

  constructor(public platform: Platform, private renderer: Renderer2) {
    console.log('CrowdPlaygroundComponent starting up');
  }

  ngAfterViewInit() {
    this.canvasElement = this.canvas.nativeElement;

    this.width = this.platform.width();
    this.height = this.platform.height() - 200;

    this.renderer.setAttribute(this.canvasElement, 'width', this.width + '');
    this.renderer.setAttribute(this.canvasElement, 'height', this.height + '');
  }

  clearCanvas() {
    const ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  startCrowd() {
    this.clearCanvas();

    this.males = new Array();
    this.females = new Array();

    for (let i = 0; i < 10; i++) {
      this.addChild(0);
      this.addChild(1);
    }

    this.move();

  }

  move() {
    setInterval(() => {
      for (let i = 0; i < this.males.length; i++) {
        this.males[i].move(1, this.random(1, 4));
      }
      for (let i = 0; i < this.females.length; i++) {
        this.females[i].move(1, this.random(1, 4));
      }
      this.handleCollision();
    }, 200);
  }

  handleCollision() {
    for (let i = 0; i < this.males.length; i++) {
      for (let j = 0; j < this.females.length; j++) {
        if (this.males[i].collides(this.females[j])) {
          if (this.males[i].age > 5 && this.females[j].age > 5) {
            const child = this.addChild(this.random(1, 2), this.males[i].x, this.males[i].y);
            console.log('a new child is born! Its a ' + (child.color === 'red' ? 'boy!' : 'girl!'));
          }
        }
      }
    }
  }

  random(min: number, max: number): number {
    return Math.floor(Math.random() * max) + min;
  }

  addChild(sex: number, x?: number, y?: number): Square {
    const ctx = this.canvasElement.getContext('2d');

    const size = 20;

    const boundX = this.width / size - 1;
    const boundY = this.height / size - 1;

    let square = new Square(
      ctx, boundX, boundY,
      x ? x : this.random(0, boundX),
      y ? y: this.random(0, boundY),
      size,
      sex === 1 ? 'red' : 'black');

    if (sex === 1) {
      this.males.push(square);
    } else {
      this.females.push(square);
    }

    square.draw();

    return square;
  }

}

export class Square {

  x: number;
  y: number;
  size: number;
  color: string;

  boundsX: number;
  boundsY: number;

  age: number;

  constructor(private ctx: CanvasRenderingContext2D, boundsX: number, boundsY: number, x: number, y: number, size: number, color?: string) {
    this.x = x
    this.y = y;
    this.size = size;
    this.color = color;

    this.boundsX = boundsX;
    this.boundsY = boundsY;

    this.age = 1;
  }

  draw() {
    this.checkBounds();

    if (this.color) {
      this.ctx.fillStyle = this.color;
    }
    this.ctx.fillRect(this.size * this.x, this.size * this.y, this.size, this.size);
  }

  clear() {
    this.ctx.clearRect(this.size * this.x, this.size * this.y, this.size, this.size);
  }

  move(steps: number, dir: number) {
    this.clear();

    switch (dir) {
      case 1: this.x = this.x + steps; break;
      case 2: this.x = this.x - steps; break;
      case 3: this.y = this.y + steps; break;
      case 4: this.y = this.y - steps; break;
    }

    this.draw();

    this.age = this.age + 1;
  }

  collides(other: Square): boolean {
    return this.x === other.x && this.y === other.y;
  }

  private checkBounds() {
    this.x = this.checkBoundsHelper(this.x, this.boundsX);
    this.y = this.checkBoundsHelper(this.y, this.boundsY);
  }

  private checkBoundsHelper(position: number, bounds: number) {
    if (position < 0) {
      return 0;
    } else if (position > bounds) {
      return bounds;
    } else {
      return position;
    }
  }

}
