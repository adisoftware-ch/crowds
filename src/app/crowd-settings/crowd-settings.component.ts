import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

export interface Settings {
  size: number;
  startno: number;
  pairingage: number;
  maxage: number;
  minage: number;
  moverange: number;
  speed: number;
  attractionrange: number;
  attractionpossibility: number;
}

@Component({
  selector: 'app-crowd-settings',
  templateUrl: './crowd-settings.component.html',
  styleUrls: ['./crowd-settings.component.scss'],
})
export class CrowdSettingsComponent implements OnInit {

  settings: Settings;

  constructor(private popoverController: PopoverController, private navParams: NavParams) { }

  ngOnInit() {
    this.settings = this.navParams.data.settings;
  }

  async closePopover() {
    await this.popoverController.dismiss(this.settings);
  }

}
