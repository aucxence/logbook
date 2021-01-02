import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss']
})
export class DashboardCardComponent implements OnInit {

  @Input() image: string;
  @Input() titre: string;
  @Input() route: string;

  @Output() onclick: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  clicked() {
    this.onclick.emit(this.route);
  }

}
