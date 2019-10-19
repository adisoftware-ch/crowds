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

  males: Map<string, Square>;
  females: Map<string, Square>;

  ctrDeaths = 0;
  ctrBirths = 0;
  ctrPopulation = 0;

  running: any;

  // parameters
  size = 3;
  startno = 20;
  pairingage = 5;
  maxage = 100;
  minage = 70;
  moverange = 3;
  speed = 50;
  attractionrange = 3;
  attractionpossibility = 20;

  constructor(public platform: Platform, private renderer: Renderer2) {
    console.log('CrowdPlaygroundComponent starting up');

    this.males = new Map();
    this.females = new Map();
  }

  ngAfterViewInit() {
    this.canvasElement = this.canvas.nativeElement;

    this.width = Math.round(this.platform.width() / this.size) * this.size;
    this.height = Math.round((this.platform.height() - 120) / this.size) * this.size;

    this.renderer.setAttribute(this.canvasElement, 'width', this.width + '');
    this.renderer.setAttribute(this.canvasElement, 'height', this.height + '');
  }

  clearCanvas() {
    const ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    this.ctrDeaths = 0;
    this.ctrBirths = 0;
    this.ctrPopulation = 0;

    this.males = new Map();
    this.females = new Map();
  }

  startCrowd() {
    this.clearCanvas();

    for (let i = 0; i < this.startno; i++) {
      this.addChild(0);
      this.addChild(1);
    }

    this.move();

  }

  stopCrowd() {
    if (this.running) {
      clearInterval(this.running);
      this.running = false;
    }
  }

  move() {
    this.running = setInterval(() => {
     // console.log('no. of males:', this.males.size);
     // console.log('no. of females:', this.females.size);

      let collisioncounter = 1;
      this.males.forEach((value: Square, key: string) => {
        if (value.age > this.maxage - this.random(1, this.maxage - this.minage)) {
          console.log('a male died!');
          this.ctrDeaths++;
          this.ctrPopulation--;
          value.die();
          this.males.delete(key);
        } else {
          value.move(this.random(1, this.moverange), this.random(1, 4));
          // check collision with same gender
          const tmpkey = value.x + '_' + value.y;
          key = this.males.get(tmpkey) ? (collisioncounter++) + '_' + tmpkey : tmpkey;
        }
      });

      this.females.forEach((value: Square, key: string) => {
        if (value.age > this.maxage - this.random(1, this.maxage - this.minage)) {
          console.log('a female died!');
          this.ctrDeaths++;
          this.ctrPopulation--;
          value.die();
          this.females.delete(key);
        } else {
          value.move(this.random(1, this.moverange), this.random(1, 4));
          // check collision with same gender
          const tmpkey = value.x + '_' + value.y;
          key = this.females.get(tmpkey) ? (collisioncounter++) + '_' + tmpkey : tmpkey;
          // check collision with males => are children on the way?
          const male = this.findMale(value.x, value.y);
          if (male) {
            if (value.age > this.pairingage && male.age > this.pairingage && this.attractionpossibility >= this.random(0, 100)) {
              const child = this.addChild(this.random(1, 2), male.x, male.y);
              this.ctrBirths++;
              console.log('a new child is born! Its a ' + (child.color === 'red' ? 'boy!' : 'girl!'));
            }
            male.overlapWith(value);
          }
        }
      });

    }, 100 - this.speed);
  }

  findMale(x: number, y: number): Square {
    for (let i = x - this.attractionrange; i <= x + this.attractionrange; i++) {
      for (let j = y - this.attractionrange; j <= y + this.attractionrange; j++) {
        const male = this.males.get(i + '_' + j);
        if (male) {
          return male;
        }
      }
    }
    return null;
  }

  random(min: number, max: number): number {
    return Math.floor(Math.random() * max) + min;
  }

  addChild(sex: number, x?: number, y?: number): Square {
    const ctx = this.canvasElement.getContext('2d');

    const boundX = this.width / this.size - 1;
    const boundY = this.height / this.size - 1;

    const square = new Square(
      ctx, boundX, boundY,
      x ? x : this.random(0, boundX),
      y ? y : this.random(0, boundY),
      this.size,
      sex === 1 ? 'red' : 'black');

    const key: string = square.x + '_' + square.y;
    if (sex === 1) {
      this.males.set(key, square);
    } else {
      this.females.set(key, square);
    }

    square.draw();
    this.ctrPopulation++;

    return square;
  }

}

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Square extends Point {

  size: number;
  color: string;

  boundsX: number;
  boundsY: number;

  age: number;

  overlap: Square;

  constructor(private ctx: CanvasRenderingContext2D, boundsX: number, boundsY: number, x: number, y: number, size: number, color?: string) {
    super(x, y);

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
    if (this.overlap) {
      if (this.overlap.x === this.x && this.overlap.y === this.y) {
        this.overlap.draw();
      }
    }
  }

  move(steps: number, dir: number) {
    this.clear();
    this.overlap = null;

    switch (dir) {
      case 1: this.x = this.x + steps; break;
      case 2: this.x = this.x - steps; break;
      case 3: this.y = this.y + steps; break;
      case 4: this.y = this.y - steps; break;
    }

    this.draw();

    this.age = this.age + 1;
  }

  die() {
    this.clear();
  }

  overlapWith(other: Square) {
    this.overlap = other;
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
