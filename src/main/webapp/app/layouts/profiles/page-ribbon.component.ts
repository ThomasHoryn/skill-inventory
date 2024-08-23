import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { ProfileService } from './profile.service';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  selector: 'jhi-page-ribbon',
  template: `
    @if (ribbonEnv$ | async; as ribbonEnv) {
      <p-tag icon="pi pi-code" severity="danger" [value]="'global.ribbon.' + (ribbonEnv ?? '') | translate" />
    }
  `,
  styleUrl: './page-ribbon.component.scss',
  imports: [SharedModule, TagModule],
})
export default class PageRibbonComponent implements OnInit {
  ribbonEnv$?: Observable<string | undefined>;

  private profileService = inject(ProfileService);

  ngOnInit(): void {
    this.ribbonEnv$ = this.profileService.getProfileInfo().pipe(map(profileInfo => profileInfo.ribbonEnv));
  }
}
