import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-day-box',
  templateUrl: './day-box.component.html',
  styleUrls: ['./day-box.component.scss']
})
export class DayBoxComponent implements OnInit {

  selected = false;

  constructor() { }

  ngOnInit(): void {
  }

}
