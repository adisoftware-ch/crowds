import { Component, AfterViewInit, ViewChild, Renderer } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'crowd-playground',
  templateUrl: './crowd-playground.component.html',
  styleUrls: ['./crowd-playground.component.scss'],
})
export class CrowdPlaygroundComponent implements AfterViewInit {

  @ViewChild('crowdPlayground', null) canvas: any;

    canvasElement: any;
    lastX: number;
    lastY: number;

    constructor(public platform: Platform, public renderer: Renderer) {
        console.log('Hello CanvasDraw Component');
    }

    ngAfterViewInit() {
        this.canvasElement = this.canvas.nativeElement;

        this.renderer.setElementAttribute(this.canvasElement, 'width', this.platform.width() + '');
        this.renderer.setElementAttribute(this.canvasElement, 'height', this.platform.height() + '');
    }

    clearCanvas(){
        let ctx = this.canvasElement.getContext('2d');
        ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);   
    }

}
