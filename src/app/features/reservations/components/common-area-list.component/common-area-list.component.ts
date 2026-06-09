import { Component, OnInit } from '@angular/core';
import { CommonAreaCardComponent } from '../common-area-card.component/common-area-card.component';
import { CommonAreaService } from '../../services/common-area.service';
import { CommonArea } from '../../model/common-area.model';

@Component({
  selector: 'app-common-area-list',
  standalone: true,
  imports: [CommonAreaCardComponent],
  templateUrl: './common-area-list.component.html',
  styleUrl: './common-area-list.component.css',
})
export class CommonAreaListComponent implements OnInit {
  commonAreas: CommonArea[] = [];

  constructor(private commonAreaService: CommonAreaService) {}

  ngOnInit(): void {
    this.commonAreaService.getAll().subscribe((areas) => {
      this.commonAreas = areas;
    });
  }
}
