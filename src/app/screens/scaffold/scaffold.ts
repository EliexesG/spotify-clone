import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReproductionController } from '../../components/reproduction-controller/reproduction-controller';

@Component({
  selector: 'app-scaffold',
  imports: [RouterOutlet, ReproductionController],
  templateUrl: './scaffold.html',
  styleUrl: './scaffold.scss',
})
export class Scaffold {}
