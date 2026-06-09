import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitsResidentsPage} from '../../features/buildings/pages/units-residents-page/units-residents-page';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [CommonModule, UnitsResidentsPage],
  templateUrl: './units.html',
  styleUrl: './units.css'
})
export class Units {}
